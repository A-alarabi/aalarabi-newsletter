import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NewsletterSchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const all = searchParams.get('all') === 'true'

  // Check if admin is requesting all newsletters
  if (all) {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const newsletters = await prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        status: true,
        publishedAt: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ data: newsletters })
  }

  // Public: only published newsletters
  const newsletters = await prisma.newsletter.findMany({
    where: {
      status: 'published',
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      status: true,
      publishedAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ data: newsletters })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = NewsletterSchema.parse(body)

    const slug = slugify(validated.title)

    const newsletter = await prisma.newsletter.create({
      data: {
        title: validated.title,
        slug,
        description: validated.description,
        content: validated.content,
        coverImage: validated.coverImage || null,
        status: validated.status,
        publishedAt: validated.status === 'published' ? new Date() : null,
      },
    })

    return NextResponse.json({ data: newsletter }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
