import { Suspense } from 'react'
import SiteHeader from '@/components/layout/SiteHeader'
import NewsletterGrid from '@/components/home/NewsletterGrid'
import SubscriptionForm from '@/components/newsletter/SubscriptionForm'
import { prisma } from '@/lib/prisma'
import type { NewsletterListItem } from '@/types'

interface HomePageProps {
  searchParams: Promise<{ search?: string }>
}

async function getNewsletters(search?: string): Promise<NewsletterListItem[]> {
  const newsletters = await prisma.newsletter.findMany({
    where: {
      status: 'published',
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: 'desc' },
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
  return newsletters as NewsletterListItem[]
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { search } = await searchParams
  const newsletters = await getNewsletters(search)

  return (
    <>
      <SiteHeader />

      <main>
        <section className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
          {search && (
            <div className="mb-6 text-sm text-gray-500">
              نتائج البحث عن:{' '}
              <span className="font-semibold text-[#1a1a2e]">"{search}"</span>
              {' — '}{newsletters.length} نتيجة
            </div>
          )}

          <Suspense>
            <NewsletterGrid newsletters={newsletters} searchQuery={search} />
          </Suspense>
        </section>

        <section className="max-w-5xl mx-auto px-6 sm:px-10 pb-8">
          <SubscriptionForm />
        </section>
      </main>

      <div className="pt-2 pb-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} جميع الحقوق محفوظة لعبد الله خليل العربي
      </div>
    </>
  )
}