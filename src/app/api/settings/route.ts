import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Always ensure one settings row exists
async function getOrCreateSettings() {
  let settings = await prisma.siteSettings.findFirst()
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        siteName: 'النشرة الأسبوعية',
        description: 'نشرة خفيفة أشارك فيها أبرز ما استفدته خلال الأسبوع',
        accentColor: '#e63946',
      },
    })
  }
  return settings
}

export async function GET() {
  const settings = await getOrCreateSettings()
  return NextResponse.json({ data: settings })
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const settings = await getOrCreateSettings()

    const updated = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        siteName: body.siteName ?? settings.siteName,
        description: body.description ?? settings.description,
        logoUrl: body.logoUrl !== undefined ? body.logoUrl : settings.logoUrl,
        accentColor: body.accentColor ?? settings.accentColor,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
