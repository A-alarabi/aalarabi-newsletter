import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await request.json()

  const link = await prisma.socialLink.update({
    where: { id: parseInt(id) },
    data: {
      title: body.title,
      url: body.url,
      platform: body.platform,
      iconUrl: body.iconUrl,
      enabled: body.enabled,
      sortOrder: body.sortOrder,
    },
  })

  return NextResponse.json({ data: link })
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  await prisma.socialLink.delete({ where: { id: parseInt(id) } })
  return new NextResponse(null, { status: 204 })
}
