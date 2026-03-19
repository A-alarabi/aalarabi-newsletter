import { prisma } from '@/lib/prisma'
import CampaignForm from '@/components/admin/CampaignForm'

export const metadata = { title: 'حملة بريدية جديدة | لوحة الإدارة' }

export default async function NewCampaignPage() {
  const [newsletters, subscriberCount] = await Promise.all([
    prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, status: true },
    }),
    prisma.subscriber.count(),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">حملة بريدية جديدة</h1>
        <p className="text-gray-500 text-sm mt-1">أرسل بريداً إلكترونياً لجميع مشتركيك</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-3xl">
        <CampaignForm newsletters={newsletters} subscriberCount={subscriberCount} />
      </div>
    </div>
  )
}
