import { prisma } from '@/lib/prisma'
import SubscriberTable from '@/components/admin/SubscriberTable'
import type { Subscriber } from '@/types'

export const metadata = {
  title: 'المشتركون | لوحة الإدارة',
}

export default async function AdminSubscribersPage() {
  const [subscribers, total] = await Promise.all([
    prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscriber.count(),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">المشتركون</h1>
        <p className="text-gray-500 text-sm mt-1">
          إجمالي: {total.toLocaleString('ar')} مشترك
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <SubscriberTable
          subscribers={subscribers as Subscriber[]}
          total={total}
        />
      </div>
    </div>
  )
}
