import { prisma } from '@/lib/prisma'

export async function getSiteSettings() {
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

export async function getEnabledSocialLinks() {
  return prisma.socialLink.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getAllSocialLinks() {
  return prisma.socialLink.findMany({
    orderBy: { sortOrder: 'asc' },
  })
}
