import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import Footer from '@/components/layout/Footer'
import NewsletterContent from '@/components/newsletter/NewsletterContent'
import SubscriptionForm from '@/components/newsletter/SubscriptionForm'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getNewsletter(slug: string) {
  return prisma.newsletter.findFirst({
    where: { slug, status: 'published' },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const newsletter = await getNewsletter(slug)
  if (!newsletter) return {}

  return {
    title: newsletter.title,
    description: newsletter.description,
    openGraph: {
      title: newsletter.title,
      description: newsletter.description,
      images: newsletter.coverImage ? [newsletter.coverImage] : [],
      type: 'article',
      locale: 'ar_SA',
    },
  }
}

export default async function NewsletterPage({ params }: PageProps) {
  const { slug } = await params
  const newsletter = await getNewsletter(slug)

  if (!newsletter) notFound()

  const date = newsletter.publishedAt || newsletter.createdAt

  return (
    <>
      <SiteHeader compact />

      <main className="min-h-screen">
        {/* Cover image */}
        {newsletter.coverImage && (
          <div className="relative h-64 sm:h-80 w-full overflow-hidden max-w-3xl mx-auto mt-6 rounded-2xl px-4 sm:px-0">
            <Image
              src={newsletter.coverImage}
              alt={newsletter.title}
              fill
              className="object-cover rounded-2xl"
              priority
            />
          </div>
        )}

        {/* Article */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {/* Header */}
          <header className="mb-8">
            <time className="text-sm text-gray-400 font-medium">
              {formatDate(date)}
            </time>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-[#1a1a2e] dark:text-gray-100 leading-tight">
              {newsletter.title}
            </h1>
            <p className="mt-3 text-base text-gray-500 leading-relaxed border-r-4 border-[#e63946] pr-4">
              {newsletter.description}
            </p>
          </header>

          <hr className="border-gray-100 dark:border-gray-800 mb-8" />

          {/* Content */}
          <NewsletterContent content={newsletter.content} />
        </article>

        {/* Subscribe */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
          <SubscriptionForm />
        </section>
      </main>

      <Footer />
    </>
  )
}
