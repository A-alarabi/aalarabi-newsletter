import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// ─── In-memory rate limiter (per email, resets in 15 min) ────────────────────
const attempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(email: string): boolean {
  const now = Date.now()
  const entry = attempts.get(email)
  if (!entry || entry.resetAt < now) {
    attempts.set(email, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return false
  }
  if (entry.count >= 5) return true
  entry.count++
  return false
}

function clearAttempts(email: string) {
  attempts.delete(email)
}

// ─────────────────────────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/studio',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Rate limit by email
        if (isRateLimited(credentials.email)) {
          throw new Error('too_many_attempts')
        }

        const admin = await prisma.adminUser.findUnique({
          where: { email: credentials.email },
        })

        // Always run bcrypt to prevent timing attacks
        const hash = admin?.passwordHash ?? '$2b$10$placeholder.hash.to.prevent.timing'
        const isValid = await bcrypt.compare(credentials.password, hash)

        if (!admin || !isValid) return null

        clearAttempts(credentials.email)
        return {
          id: String(admin.id),
          email: admin.email,
          role: 'admin',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
