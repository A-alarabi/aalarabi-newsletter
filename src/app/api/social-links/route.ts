import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const links = await prisma.socialLink.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json({ data: links })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const maxOrder = await prisma.socialLink.aggregate({ _max: { sortOrder: true } })
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1

    const link = await prisma.socialLink.create({
      data: {
        title: body.title,
        url: body.url,
        platform: body.platform || null,
        iconUrl: body.iconUrl || null,
        enabled: body.enabled !== undefined ? body.enabled : true,
        sortOrder: nextOrder,
      },
    })
    return NextResponse.json({ data: link }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
