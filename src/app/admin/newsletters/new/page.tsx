import NewsletterForm from '@/components/admin/NewsletterForm'

export const metadata = {
  title: 'نشرة جديدة | لوحة الإدارة',
}

export default function NewNewsletterPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">نشرة جديدة</h1>
        <p className="text-gray-500 text-sm mt-1">
          أنشئ محتوى جديداً لمشتركيك
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-4xl">
        <NewsletterForm />
      </div>
    </div>
  )
}
