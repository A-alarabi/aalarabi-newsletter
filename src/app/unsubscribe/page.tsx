'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function UnsubscribeForm() {
  const params = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error' | 'notoken'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) setStatus('notoken')
  }, [token])

  const handleConfirm = async () => {
    if (!token) return
    setStatus('loading')
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const json = await res.json()
      if (res.ok) {
        setStatus('done')
      } else {
        setStatus('error')
        setMessage(json.error || 'حدث خطأ غير متوقع')
      }
    } catch {
      setStatus('error')
      setMessage('خطأ في الاتصال. يرجى المحاولة لاحقاً.')
    }
  }

  if (status === 'notoken') {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">🔗</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">رابط غير صالح</h2>
        <p className="text-gray-500 text-sm mb-6">
          الرابط الذي استخدمته غير صحيح أو منتهي الصلاحية.
        </p>
        <Link href="/" className="text-[#e63946] text-sm hover:underline">
          العودة إلى الموقع
        </Link>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">تم إلغاء الاشتراك</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          لن تصلك رسائل منا بعد الآن.<br />
          يمكنك الاشتراك مجدداً في أي وقت من الصفحة الرئيسية.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1a1a2e] hover:text-[#e63946] transition-colors"
        >
          العودة إلى الموقع
        </Link>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">حدث خطأ</h2>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <button
          onClick={() => setStatus('idle')}
          className="text-[#e63946] text-sm hover:underline"
        >
          حاول مجدداً
        </button>
      </div>
    )
  }

  // idle / loading — show confirmation prompt
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">إلغاء الاشتراك</h2>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        هل أنت متأكد أنك تريد إلغاء اشتراكك؟<br />
        لن تصلك أي رسائل منا بعد ذلك.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleConfirm}
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 bg-[#1a1a2e] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#e63946] transition-colors disabled:opacity-50"
        >
          {status === 'loading' && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {status === 'loading' ? 'جارٍ المعالجة...' : 'نعم، إلغاء الاشتراك'}
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center text-sm font-medium text-gray-600 px-6 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          الاحتفاظ بالاشتراك
        </Link>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#1a1a2e] font-bold text-xl">
            <div className="w-9 h-9 bg-[#1a1a2e] rounded-xl flex items-center justify-center text-white font-bold text-base">
              ع
            </div>
            النشرة
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <Suspense fallback={<div className="text-center text-gray-400 text-sm">جارٍ التحميل...</div>}>
            <UnsubscribeForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
