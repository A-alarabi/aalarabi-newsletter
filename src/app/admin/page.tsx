import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const [newsletterCount, publishedCount, subscriberCount] = await Promise.all([
    prisma.newsletter.count(),
    prisma.newsletter.count({ where: { status: 'published' } }),
    prisma.subscriber.count(),
  ])

  const stats = [
    {
      label: 'إجمالي النشرات',
      value: newsletterCount,
      icon: '📰',
      href: '/admin/newsletters',
      color: 'bg-blue-50 border-blue-100',
    },
    {
      label: 'النشرات المنشورة',
      value: publishedCount,
      icon: '✅',
      href: '/admin/newsletters',
      color: 'bg-emerald-50 border-emerald-100',
    },
    {
      label: 'المشتركون',
      value: subscriberCount,
      icon: '👥',
      href: '/admin/subscribers',
      color: 'bg-purple-50 border-purple-100',
    },
    {
      label: 'المسودات',
      value: newsletterCount - publishedCount,
      icon: '📝',
      href: '/admin/newsletters',
      color: 'bg-amber-50 border-amber-100',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-1">نظرة عامة على النشرة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`${stat.color} border rounded-2xl p-6 hover:shadow-md transition-shadow`}
          >
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div className="text-3xl font-bold text-[#1a1a2e] mb-1">
              {stat.value.toLocaleString('ar')}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-[#1a1a2e] mb-4">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/newsletters/new"
            className="inline-flex items-center gap-2 bg-[#e63946] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#c1121f] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            نشرة جديدة
          </Link>
          <Link
            href="/admin/newsletters"
            className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#16213e] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            إدارة النشرات
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            عرض الموقع
          </Link>
        </div>
      </div>
    </div>
  )
}
