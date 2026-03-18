import Link from 'next/link'
import Image from 'next/image'
import { formatDate, truncate, stripHtml } from '@/lib/utils'
import type { NewsletterListItem } from '@/types'

interface NewsletterCardProps {
  newsletter: NewsletterListItem
}

export default function NewsletterCard({ newsletter }: NewsletterCardProps) {
  const description = truncate(stripHtml(newsletter.description), 130)
  const date = newsletter.publishedAt || newsletter.createdAt

  return (
    <Link
      href={`/newsletter/${newsletter.slug}`}
      className="group flex gap-4 py-5 border-b border-gray-100 hover:bg-gray-50/50 -mx-4 px-4 rounded-xl transition-colors"
    >
      {/* Cover thumbnail */}
      {newsletter.coverImage ? (
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          <Image
            src={newsletter.coverImage}
            alt={newsletter.title}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      ) : (
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] flex items-center justify-center">
          <span className="text-white/20 text-3xl font-bold">ع</span>
        </div>
      )}

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <time className="text-xs text-gray-400">{formatDate(date)}</time>
        <h2 className="mt-1 text-base font-bold text-[#1a1a2e] leading-snug group-hover:text-[#e63946] transition-colors line-clamp-2">
          {newsletter.title}
        </h2>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  )
}
