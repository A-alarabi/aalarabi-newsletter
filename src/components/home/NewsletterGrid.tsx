import NewsletterCard from './NewsletterCard'
import type { NewsletterListItem } from '@/types'

interface NewsletterGridProps {
  newsletters: NewsletterListItem[]
  searchQuery?: string
}

export default function NewsletterGrid({
  newsletters,
  searchQuery,
}: NewsletterGridProps) {
  if (newsletters.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          {searchQuery ? 'لا توجد نتائج' : 'لا توجد نشرات بعد'}
        </h3>
        <p className="text-gray-400 text-sm">
          {searchQuery
            ? `لم نجد نتائج لـ "${searchQuery}"`
            : 'تابعونا قريباً لمزيد من المحتوى'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {newsletters.map((newsletter) => (
        <NewsletterCard key={newsletter.id} newsletter={newsletter} />
      ))}
    </div>
  )
}
