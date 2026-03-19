import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { broadcastNewsletter } from '@/lib/email'
import { getSiteSettings } from '@/lib/site'
import { z } from 'zod'

const CampaignSchema = z.object({
  subject: z.string().min(1, 'الموضوع مطلوب').max(200),
  message: z.string().min(1, 'نص الرسالة مطلوب'),
  ctaText: z.string().max(100).optional(),
  newsletterId: z.number().optional(),
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const validated = CampaignSchema.parse(body)

    const [subscribers, settings] = await Promise.all([
      prisma.subscriber.findMany({
        select: { firstName: true, email: true, unsubscribeToken: true },
      }),
      getSiteSettings(),
    ])

    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'لا يوجد مشتركون لإرسال الحملة إليهم.' }, { status: 400 })
    }

    // Resolve linked newsletter (optional)
    let newsletter: { title: string; slug: string } = {
      title: validated.subject,
      slug: '',
    }

    if (validated.newsletterId) {
      const nl = await prisma.newsletter.findUnique({
        where: { id: validated.newsletterId },
        select: { title: true, slug: true },
      })
      if (nl) newsletter = nl
    }

    const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Fire-and-forget: respond immediately, email sends in background
    broadcastNewsletter({
      newsletter,
      subscribers,
      siteUrl,
      siteName: settings.siteName,
      emailSubject: validated.subject,
      emailMessage: validated.message,
      emailCtaText: validated.ctaText,
    }).catch((err) => console.error('[Campaign] Broadcast error:', err))

    return NextResponse.json({
      data: { sent: subscribers.length, message: `جاري إرسال البريد إلى ${subscribers.length} مشترك` },
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }
}
