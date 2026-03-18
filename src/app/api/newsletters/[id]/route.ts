import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateNewsletterSchema } from '@/lib/validations'
import { broadcastNewsletter } from '@/lib/email'
import { getSiteSettings } from '@/lib/site'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const newsletter = await prisma.newsletter.findUnique({
    where: { id: parseInt(id) },
  })

  if (!newsletter) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ data: newsletter })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const body = await request.json()
    const validated = UpdateNewsletterSchema.parse(body)

    const existing = await prisma.newsletter.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isNewlyPublished =
      validated.status === 'published' && existing.status !== 'published'

    // Extract email fields before writing to DB (they are not DB columns)
    const { emailSubject, emailMessage, emailCtaText, ...newsletterData } = validated

    const newsletter = await prisma.newsletter.update({
      where: { id: parseInt(id) },
      data: {
        ...newsletterData,
        coverImage: newsletterData.coverImage === '' ? null : newsletterData.coverImage,
        publishedAt: isNewlyPublished ? new Date() : existing.publishedAt,
      },
    })

    // Fire-and-forget email broadcast when first published
    if (isNewlyPublished) {
      const [subscribers, settings] = await Promise.all([
        prisma.subscriber.findMany({ select: { firstName: true, email: true, unsubscribeToken: true } }),
        getSiteSettings(),
      ])
      const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      broadcastNewsletter({
        newsletter: { title: newsletter.title, slug: newsletter.slug },
        subscribers,
        siteUrl,
        siteName: settings.siteName,
        emailSubject,
        emailMessage,
        emailCtaText,
      }).catch((err) => console.error('[Email] Broadcast error:', err))
    }

    return NextResponse.json({ data: newsletter })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const existing = await prisma.newsletter.findUnique({
    where: { id: parseInt(id) },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.newsletter.delete({ where: { id: parseInt(id) } })

  return new NextResponse(null, { status: 204 })
}
