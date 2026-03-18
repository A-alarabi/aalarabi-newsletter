import { formatDate } from '@/lib/utils'
import type { Subscriber } from '@/types'

interface SubscriberTableProps {
  subscribers: Subscriber[]
  total: number
}

export default function SubscriberTable({ subscribers, total }: SubscriberTableProps) {
  if (subscribers.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-4xl mb-3">📭</div>
        <p>لا يوجد مشتركون بعد</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 text-sm text-gray-500">
        إجمالي المشتركين: <span className="font-semibold text-[#1a1a2e]">{total}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-start py-3 px-4 text-gray-500 font-medium">الاسم</th>
              <th className="text-start py-3 px-4 text-gray-500 font-medium">البريد الإلكتروني</th>
              <th className="text-start py-3 px-4 text-gray-500 font-medium">تاريخ الاشتراك</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr
                key={sub.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-3 px-4 font-medium text-[#1a1a2e]">{sub.firstName}</td>
                <td className="py-3 px-4 text-gray-500" dir="ltr">
                  {sub.email}
                </td>
                <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                  {formatDate(sub.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
