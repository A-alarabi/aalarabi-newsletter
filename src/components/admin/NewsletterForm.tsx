'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Input, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Newsletter } from '@/types'

const RichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor'),
  { ssr: false, loading: () => <div className="h-64 bg-gray-50 rounded-xl border border-gray-200 animate-pulse" /> }
)

interface FormData {
  title: string
  description: string
  content: string
  coverImage: string
}

interface EmailModalData {
  emailSubject: string
  emailMessage: string
  emailCtaText: string
}

interface NewsletterFormProps {
  newsletter?: Newsletter
}

export default function NewsletterForm({ newsletter }: NewsletterFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState<'draft' | 'published' | null>(null)
  const [error, setError] = useState('')
  const [coverPreview, setCoverPreview] = useState<string>(newsletter?.coverImage || '')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: newsletter?.title || '',
      description: newsletter?.description || '',
      content: newsletter?.content || '',
      coverImage: newsletter?.coverImage || '',
    },
  })

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    reset: resetEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailModalData>({
    defaultValues: {
      emailSubject: '',
      emailMessage: '',
      emailCtaText: 'اقرأ العدد الجديد',
    },
  })

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const json = await res.json()
        if (json.data?.url) {
          setCoverPreview(json.data.url)
          setValue('coverImage', json.data.url)
        }
      } else {
        setError('فشل رفع الصورة. يرجى المحاولة مجدداً.')
      }
    } catch {
      setError('خطأ أثناء رفع الصورة.')
    } finally {
      setUploadingCover(false)
    }
  }

  const submitNewsletter = async (
    data: FormData,
    status: 'draft' | 'published',
    emailData?: EmailModalData
  ) => {
    setSaving(status)
    setError('')

    try {
      const url = newsletter
        ? `/api/newsletters/${newsletter.id}`
        : '/api/newsletters'
      const method = newsletter ? 'PATCH' : 'POST'

      const payload: Record<string, unknown> = { ...data, status }
      if (emailData && status === 'published') {
        if (emailData.emailSubject) payload.emailSubject = emailData.emailSubject
        if (emailData.emailMessage) payload.emailMessage = emailData.emailMessage
        if (emailData.emailCtaText) payload.emailCtaText = emailData.emailCtaText
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'حدث خطأ أثناء الحفظ')
        return
      }

      router.push('/admin/newsletters')
      router.refresh()
    } catch {
      setError('حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.')
    } finally {
      setSaving(null)
    }
  }

  // "نشر الآن" → validate main form, then open email composition modal
  const handlePublishClick = handleSubmit((data) => {
    setPendingFormData(data)
    resetEmail({
      emailSubject: data.title,
      emailMessage: '',
      emailCtaText: 'اقرأ العدد الجديد',
    })
    setShowPublishModal(true)
  })

  // Modal confirm → submit with email content
  const handleModalConfirm = handleEmailSubmit(async (emailData) => {
    setShowPublishModal(false)
    if (pendingFormData) {
      await submitNewsletter(pendingFormData, 'published', emailData)
    }
  })

  return (
    <>
      <form className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Input
          label="عنوان النشرة"
          placeholder="أدخل عنواناً جذاباً..."
          {...register('title', { required: 'العنوان مطلوب' })}
          error={errors.title?.message}
        />

        <Textarea
          label="وصف مختصر"
          placeholder="ملخص قصير يظهر في القائمة الرئيسية..."
          rows={3}
          {...register('description', { required: 'الوصف مطلوب' })}
          error={errors.description?.message}
        />

        {/* Cover image upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">صورة الغلاف (اختياري)</label>
          <input type="hidden" {...register('coverImage')} />

          <div className="flex gap-3 items-start">
            {coverPreview ? (
              <div className="relative w-32 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                <Image src={coverPreview} alt="غلاف" fill className="object-cover" sizes="128px" />
                <button
                  type="button"
                  onClick={() => { setCoverPreview(''); setValue('coverImage', ''); }}
                  className="absolute top-1 left-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="w-32 h-24 rounded-xl shrink-0 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {uploadingCover ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
                {uploadingCover ? 'جاري الرفع...' : 'رفع صورة'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleCoverUpload(file)
                  e.target.value = ''
                }}
              />
              <p className="text-xs text-gray-400">JPG, PNG, WebP — حد 5 ميجا</p>
            </div>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">محتوى النشرة</label>
          <Controller
            name="content"
            control={control}
            rules={{ required: 'المحتوى مطلوب' }}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="ابدأ الكتابة هنا..."
              />
            )}
          />
          {errors.content && (
            <p className="text-xs text-red-500">{errors.content.message}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="primary"
            size="lg"
            loading={saving === 'published'}
            disabled={saving !== null}
            onClick={handlePublishClick}
          >
            نشر الآن
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            loading={saving === 'draft'}
            disabled={saving !== null}
            onClick={handleSubmit((data) => submitNewsletter(data, 'draft'))}
          >
            حفظ كمسودة
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={saving !== null}
            onClick={() => router.back()}
          >
            إلغاء
          </Button>
        </div>
      </form>

      {/* Publish / Email Composition Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPublishModal(false)}
          />

          {/* Modal panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#1a1a2e]">إعداد البريد الإلكتروني</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  سيُرسل هذا البريد لجميع المشتركين عند النشر
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleModalConfirm} className="space-y-4">
              {/* Email Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  موضوع الرسالة
                </label>
                <input
                  type="text"
                  placeholder="مثال: عدد جديد — نظام الإنتاجية الذي غيّر حياتي"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent"
                  {...registerEmail('emailSubject')}
                />
              </div>

              {/* Email Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  نص الرسالة
                  <span className="text-gray-400 font-normal mr-1.5 text-xs">(اختياري)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="فقرة قصيرة تظهر في جسم البريد قبل زر القراءة..."
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent resize-none"
                  {...registerEmail('emailMessage')}
                />
              </div>

              {/* CTA Text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  نص زر القراءة
                </label>
                <input
                  type="text"
                  placeholder="اقرأ العدد الجديد"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent"
                  {...registerEmail('emailCtaText')}
                />
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-amber-700 leading-relaxed">
                  سيحتوي البريد على: اسم المشترك، عنوان النشرة، نصك، وزر للقراءة.
                  إذا تركت حقلاً فارغاً، يُستخدم النص الافتراضي.
                </p>
              </div>

              {/* Modal actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving !== null}
                  className="flex-1 bg-[#e63946] text-white text-sm font-bold py-2.5 rounded-lg hover:bg-[#c1121f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving === 'published' ? 'جاري النشر...' : 'نشر وإرسال البريد'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-5 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
