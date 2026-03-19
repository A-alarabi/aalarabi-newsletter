'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const RichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor'),
  { ssr: false, loading: () => <div className="h-48 bg-gray-50 rounded-xl border border-gray-200 animate-pulse" /> }
)

interface Newsletter {
  id: number
  title: string
  slug: string
  status: string
}

interface CampaignFormProps {
  newsletters: Newsletter[]
  subscriberCount: number
}

export default function CampaignForm({ newsletters, subscriberCount }: CampaignFormProps) {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [ctaText, setCtaText] = useState('اقرأ المزيد')
  const [newsletterId, setNewsletterId] = useState<number | ''>('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSend = async () => {
    if (!subject.trim()) { setResult({ type: 'error', text: 'موضوع الرسالة مطلوب.' }); return }
    if (!message.trim() || message === '<p></p>') { setResult({ type: 'error', text: 'نص الرسالة مطلوب.' }); return }

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
          ctaText: ctaText || undefined,
          newsletterId: newsletterId ? Number(newsletterId) : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setResult({ type: 'error', text: json.error || 'فشل الإرسال.' })
      } else {
        setResult({ type: 'success', text: json.data?.message || 'تم الإرسال بنجاح.' })
        // Reset form after success
        setTimeout(() => router.push('/admin/campaigns'), 2000)
      }
    } catch {
      setResult({ type: 'error', text: 'خطأ في الاتصال. يرجى المحاولة لاحقاً.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Subscriber count banner */}
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm text-emerald-700">
          سيُرسل البريد إلى <strong>{subscriberCount.toLocaleString('ar')}</strong> مشترك
        </p>
      </div>

      {/* Subject */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          موضوع الرسالة <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="مثال: عدد جديد — هذا الأسبوع في النشرة"
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent"
        />
      </div>

      {/* Linked newsletter (optional) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          ربط بنشرة <span className="text-gray-400 font-normal text-xs">(اختياري — يُستخدم رابطها في زر القراءة)</span>
        </label>
        <select
          value={newsletterId}
          onChange={(e) => setNewsletterId(e.target.value ? Number(e.target.value) : '')}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent bg-white"
        >
          <option value="">— بدون ربط —</option>
          {newsletters.map((nl) => (
            <option key={nl.id} value={nl.id}>
              {nl.title} {nl.status === 'published' ? '✓' : '(مسودة)'}
            </option>
          ))}
        </select>
      </div>

      {/* CTA button text */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">نص زر القراءة</label>
        <input
          type="text"
          value={ctaText}
          onChange={(e) => setCtaText(e.target.value)}
          placeholder="اقرأ المزيد"
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent"
        />
      </div>

      {/* Message body */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          نص الرسالة <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 -mt-1">
          يظهر هذا النص في جسم البريد الإلكتروني قبل زر القراءة. يمكنك تنسيقه بحرية.
        </p>
        <RichTextEditor
          value={message}
          onChange={setMessage}
          placeholder="اكتب نص رسالتك هنا..."
        />
      </div>

      {/* Scheduling note */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-xs text-amber-700 font-medium mb-0.5">الجدولة — MVP</p>
          <p className="text-xs text-amber-600 leading-relaxed">
            الإرسال الآن متاح بالكامل. الجدولة لوقت لاحق غير مطبّقة بعد وتحتاج إلى خدمة طوابير (Queue) أو Cron Job — يمكن إضافتها لاحقاً.
          </p>
        </div>
      </div>

      {/* Feedback */}
      {result && (
        <div className={`rounded-lg px-4 py-3 text-sm ${
          result.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {result.text}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-[#16213e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              جاري الإرسال...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              إرسال الآن
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={sending}
          className="px-5 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          إلغاء
        </button>
      </div>
    </div>
  )
}
