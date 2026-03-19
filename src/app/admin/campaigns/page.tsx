import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'الحملات البريدية | لوحة الإدارة' }

export default async function CampaignsPage() {
  const subscriberCount = await prisma.subscriber.count()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">الحملات البريدية</h1>
          <p className="text-gray-500 text-sm mt-1">أرسل بريداً إلكترونياً مخصصاً لمشتركيك</p>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#16213e] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          حملة جديدة
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-lg">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-[#1a1a2e]">{subscriberCount.toLocaleString('ar')}</div>
          <div className="text-sm text-gray-500 mt-0.5">مشترك نشط</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-3xl mb-2">📬</div>
          <div className="text-2xl font-bold text-[#1a1a2e]">—</div>
          <div className="text-sm text-gray-500 mt-0.5">حملات مرسلة</div>
          <div className="text-xs text-gray-400 mt-1">سجل الحملات قريباً</div>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-2xl">
        <h2 className="font-semibold text-[#1a1a2e] mb-3">كيف تعمل الحملات؟</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-[#e63946] font-bold mt-0.5">١.</span>
            اكتب موضوع الرسالة ونصها في المحرر
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#e63946] font-bold mt-0.5">٢.</span>
            اختر (اختيارياً) نشرة لربط زر القراءة بها
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#e63946] font-bold mt-0.5">٣.</span>
            اضغط &quot;إرسال الآن&quot; — يصل البريد لجميع المشتركين فوراً
          </li>
        </ul>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2 text-xs text-amber-600">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          الجدولة لوقت لاحق غير متاحة بعد — متاح حالياً الإرسال الفوري فقط.
        </div>

        <div className="mt-4">
          <Link
            href="/admin/campaigns/new"
            className="inline-flex items-center gap-2 bg-[#e63946] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#c1121f] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            إنشاء حملة جديدة
          </Link>
        </div>
      </div>
    </div>
  )
}
