'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { SubscribeInput } from '@/lib/validations'

interface Settings {
  siteName: string
  description: string
  logoUrl: string | null
  accentColor: string
}

interface Props {
  settings: Settings
}

export default function SubscriptionFormClient({ settings }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscribeInput>()

  const onSubmit = async (data: SubscribeInput) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (res.status === 409) {
        setStatus('duplicate')
        setMessage('بريدك الإلكتروني مسجّل بالفعل في قائمتنا')
        return
      }
      if (!res.ok) {
        setStatus('error')
        setMessage(json.error || 'حدث خطأ، يرجى المحاولة مرة أخرى')
        return
      }

      setStatus('success')
      setMessage(json.message || 'تم الاشتراك بنجاح! 🎉')
      reset()
    } catch {
      setStatus('error')
      setMessage('حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.')
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div
        id="subscribe"
        className="max-w-[520px] mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Header: logo */}
        <div className="flex items-start justify-start px-4 pt-4">
          <LogoBlock settings={settings} />
        </div>

        {/* Success message */}
        <div className="px-5 pt-2 pb-5 text-right">
          <div className="text-2xl mb-1">🎉</div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-0.5">{message}</h3>
          <p className="text-[12px] text-gray-400">سنُبلغك بكل جديد عبر بريدك الإلكتروني</p>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-right">
          <button
            onClick={() => setStatus('idle')}
            className="text-[11px] text-gray-400 underline hover:no-underline"
          >
            الاشتراك بعنوان آخر
          </button>
        </div>
      </div>
    )
  }

  // ── Main card ──────────────────────────────────────────────────────────────
  return (
    <div id="subscribe" className="max-w-[520px] mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* ── Header: logo only (no dismiss button) ── */}
        <div className="flex items-start justify-start px-4 pt-4">
          <LogoBlock settings={settings} />
        </div>

        {/* ── Content: title + description ── */}
        <div className="px-5 pt-2.5 pb-3 text-right">
          <h2 className="text-[18px] font-black text-gray-900 leading-snug mb-1.5">
            {settings.siteName}
          </h2>
          {settings.description && (
            <p className="text-[12.5px] text-gray-500 leading-relaxed">
              {settings.description}
            </p>
          )}
        </div>

        {/* ── Divider ── */}
        <hr className="border-gray-100 mx-5" />

        {/* ── Footer: form + policy ── */}
        <div className="px-5 pt-3.5 pb-4 bg-gray-50/60">

          {/* Error / duplicate */}
          {(status === 'error' || status === 'duplicate') && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[12px] text-red-600 text-right">
              {message}
            </div>
          )}

          {/* Single-row form: [email][name][button] — RTL: email rightmost */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-end gap-2">

              {/* Email — rightmost in RTL */}
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] text-gray-400 mb-1 text-right">
                  بريدك المفضل
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-[7px] text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 text-right"
                  {...register('email', { required: 'البريد مطلوب' })}
                />
              </div>

              {/* Name — middle */}
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] text-gray-400 mb-1 text-right">
                  اسمك الأول، بالعربية
                </label>
                <input
                  type="text"
                  placeholder="عبد الله"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-[7px] text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 text-right"
                  {...register('firstName', { required: 'الاسم مطلوب' })}
                />
              </div>

              {/* Submit — leftmost in RTL */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex-shrink-0 bg-[#1a1a2e] text-white text-[13px] font-semibold px-5 py-[7px] rounded-lg hover:bg-black disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {status === 'loading' ? '...' : 'تابع'}
              </button>
            </div>

            {/* Validation errors */}
            {(errors.email || errors.firstName) && (
              <p className="mt-1.5 text-[11px] text-red-500 text-right">
                {errors.email?.message || errors.firstName?.message}
              </p>
            )}
          </form>

          {/* Policy text */}
          <p className="mt-2.5 text-[11px] text-gray-400 text-right">
            لن نشارك بريدك مع أي طرف آخر. بإمكانك إلغاء الاشتراك في أي وقت.
          </p>
        </div>

      </div>
    </div>
  )
}

// ── Logo block sub-component ──────────────────────────────────────────────────
function LogoBlock({ settings }: { settings: Settings }) {
  if (settings.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={settings.logoUrl}
        alt={settings.siteName}
        style={{ height: '56px', width: 'auto', maxWidth: '140px', objectFit: 'contain' }}
      />
    )
  }

  // Fallback: dark square with first letter of siteName
  const initial = settings.siteName.trim()[0] ?? 'ع'
  return (
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#2d2d5e] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xl font-black">{initial}</span>
    </div>
  )
}
