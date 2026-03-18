import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SubscribeSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = SubscribeSchema.parse(body)

    const existing = await prisma.subscriber.findUnique({
      where: { email: validated.email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجّل بالفعل' },
        { status: 409 }
      )
    }

    const { randomUUID } = await import('crypto')
    const subscriber = await prisma.subscriber.create({
      data: {
        firstName: validated.firstName,
        email: validated.email,
        unsubscribeToken: randomUUID(),
      },
    })

    return NextResponse.json(
      { data: subscriber, message: 'تم الاشتراك بنجاح!' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const skip = (page - 1) * limit

  const [subscribers, total] = await Promise.all([
    prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.subscriber.count(),
  ])

  return NextResponse.json({
    data: subscribers,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  })
}
