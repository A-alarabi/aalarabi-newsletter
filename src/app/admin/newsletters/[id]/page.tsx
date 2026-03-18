import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NewsletterForm from '@/components/admin/NewsletterForm'
import type { Newsletter } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditNewsletterPage({ params }: PageProps) {
  const { id } = await params
  const newsletter = await prisma.newsletter.findUnique({
    where: { id: parseInt(id) },
  })

  if (!newsletter) notFound()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">تعديل النشرة</h1>
        <p className="text-gray-500 text-sm mt-1 truncate max-w-xl">
          {newsletter.title}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-4xl">
        <NewsletterForm newsletter={newsletter as Newsletter} />
      </div>
    </div>
  )
}
