import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const newsletterId = parseInt(id, 10)
  if (isNaN(newsletterId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const newsletter = await prisma.newsletter.findUnique({
    where: { id: newsletterId },
    select: { likes: true },
  })

  if (!newsletter) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ likes: newsletter.likes })
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const newsletterId = parseInt(id, 10)
  if (isNaN(newsletterId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const newsletter = await prisma.newsletter.update({
    where: { id: newsletterId },
    data: { likes: { increment: 1 } },
    select: { likes: true },
  })

  return NextResponse.json({ likes: newsletter.likes })
}
