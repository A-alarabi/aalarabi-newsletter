import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import NewsletterTable from '@/components/admin/NewsletterTable'
import type { NewsletterListItem } from '@/types'

export default async function AdminNewslettersPage() {
  const newsletters = await prisma.newsletter.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      status: true,
      publishedAt: true,
      createdAt: true,
    },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">النشرات</h1>
          <p className="text-gray-500 text-sm mt-1">
            {newsletters.length} نشرة
          </p>
        </div>
        <Link
          href="/admin/newsletters/new"
          className="inline-flex items-center gap-2 bg-[#e63946] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#c1121f] transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          نشرة جديدة
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <NewsletterTable newsletters={newsletters as NewsletterListItem[]} />
      </div>
    </div>
  )
}
