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

interface NewsletterFormProps {
  newsletter?: Newsletter
}

export default function NewsletterForm({ newsletter }: NewsletterFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState<'draft' | 'published' | 'save' | null>(null)
  const [error, setError] = useState('')
  const [coverPreview, setCoverPreview] = useState<string>(newsletter?.coverImage || '')
  const [uploadingCover, setUploadingCover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: newsletter?.title || '',
      description: newsletter?.description || '',
      content: newsletter?.content || '',
      coverImage: newsletter?.coverImage || '',
    },
  })

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const json = await res.json()
        if (json.data?.url) { setCoverPreview(json.data.url); setValue('coverImage', json.data.url) }
      } else {
        setError('فشل رفع الصورة. يرجى المحاولة مجدداً.')
      }
    } catch { setError('خطأ أثناء رفع الصورة.') }
    finally { setUploadingCover(false) }
  }

  const submitNewsletter = async (
    data: FormData,
    status: 'draft' | 'published',
    savingKey: 'draft' | 'published' | 'save'
  ) => {
    setSaving(savingKey)
    setError('')
    try {
      const url = newsletter ? `/api/newsletters/${newsletter.id}` : '/api/newsletters'
      const method = newsletter ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'حدث خطأ أثناء الحفظ'); return }
      router.push('/admin/newsletters')
      router.refresh()
    } catch { setError('حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.') }
    finally { setSaving(null) }
  }

  // Save: preserves current status, never triggers email broadcast
  const handleSave = handleSubmit((data) => {
    const currentStatus = (newsletter?.status as 'draft' | 'published') || 'draft'
    submitNewsletter(data, currentStatus, 'save')
  })

  // Publish: sets published; API fires email broadcast only on FIRST publish
  const handlePublish = handleSubmit((data) => submitNewsletter(data, 'published', 'published'))

  // Save as draft: explicitly sets draft
  const handleSaveDraft = handleSubmit((data) => submitNewsletter(data, 'draft', 'draft'))

  const isEditing = !!newsletter
  const isPublished = newsletter?.status === 'published'

  return (
    <form className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
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

      {/* Cover image */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">صورة الغلاف (اختياري)</label>
        <input type="hidden" {...register('coverImage')} />
        <div className="flex gap-3 items-start">
          {coverPreview ? (
            <div className="relative w-32 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
              <Image src={coverPreview} alt="غلاف" fill className="object-cover" sizes="128px" />
              <button type="button"
                onClick={() => { setCoverPreview(''); setValue('coverImage', '') }}
                className="absolute top-1 left-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80 transition-colors">
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
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingCover}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              {uploadingCover
                ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
              }
              {uploadingCover ? 'جاري الرفع...' : 'رفع صورة'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = '' }} />
            <p className="text-xs text-gray-400">JPG, PNG, WebP — حد 5 ميجا</p>
          </div>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">محتوى النشرة</label>
        <Controller name="content" control={control} rules={{ required: 'المحتوى مطلوب' }}
          render={({ field }) => (
            <RichTextEditor value={field.value} onChange={field.onChange} placeholder="ابدأ الكتابة هنا..." />
          )} />
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100 flex-wrap">

        {/* حفظ التعديلات — keeps current status, no email */}
        {isEditing && (
          <Button type="button" variant="primary" size="lg"
            loading={saving === 'save'} disabled={saving !== null} onClick={handleSave}>
            {isPublished ? 'حفظ التعديلات' : 'حفظ'}
          </Button>
        )}

        {/* نشر الآن — only for new or still-draft */}
        {(!isEditing || !isPublished) && (
          <Button type="button" variant={isEditing ? 'outline' : 'primary'} size="lg"
            loading={saving === 'published'} disabled={saving !== null} onClick={handlePublish}>
            نشر الآن
          </Button>
        )}

        {/* حفظ كمسودة */}
        <Button type="button" variant="outline" size="lg"
          loading={saving === 'draft'} disabled={saving !== null} onClick={handleSaveDraft}>
          حفظ كمسودة
        </Button>

        <Button type="button" variant="ghost" size="lg" disabled={saving !== null} onClick={() => router.back()}>
          إلغاء
        </Button>
      </div>

      {isEditing && (
        <p className="text-xs text-gray-400 -mt-2">
          {isPublished
            ? '"حفظ التعديلات" يحدّث المنشور بدون إرسال بريد — لإرسال حملة بريدية استخدم صفحة الحملات.'
            : '"نشر الآن" ينشر النشرة فوراً — لإرسال بريد لمشتركيك استخدم صفحة الحملات بعد النشر.'}
        </p>
      )}
    </form>
  )
}
