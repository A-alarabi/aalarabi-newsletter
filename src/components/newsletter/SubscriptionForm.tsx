'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { SubscribeInput } from '@/lib/validations'

export default function SubscriptionForm() {
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

  if (status === 'success') {
    return (
      <div
        id="subscribe"
        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center"
      >
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-bold text-emerald-800 mb-1">{message}</h3>
        <p className="text-emerald-600 text-sm">
          سنُبلغك بكل جديد عبر بريدك الإلكتروني
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm text-emerald-700 underline hover:no-underline"
        >
          الاشتراك بعنوان آخر
        </button>
      </div>
    )
  }

  return (
    <section
      id="subscribe"
      className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-6 text-white"
    >
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold mb-1">اشترك في النشرة</h2>
        <p className="text-gray-300 text-sm mb-4">
          احصل على أفضل المقالات مباشرةً في بريدك الإلكتروني
        </p>

        {(status === 'error' || status === 'duplicate') && (
          <div className="mb-4 bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-3 text-sm text-red-200">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input
            type="text"
            placeholder="الاسم الأول"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15"
            {...register('firstName', { required: 'الاسم الأول مطلوب' })}
          />
          {errors.firstName && (
            <p className="text-red-300 text-xs text-start">{errors.firstName.message}</p>
          )}

          <input
            type="email"
            placeholder="البريد الإلكتروني"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15"
            {...register('email', { required: 'البريد الإلكتروني مطلوب' })}
          />
          {errors.email && (
            <p className="text-red-300 text-xs text-start">{errors.email.message}</p>
          )}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            loading={status === 'loading'}
            className="w-full"
          >
            اشترك الآن — مجاناً
          </Button>
        </form>

        <p className="mt-3 text-xs text-gray-500">
          يمكنك إلغاء الاشتراك في أي وقت.
        </p>
      </div>
    </section>
  )
}
