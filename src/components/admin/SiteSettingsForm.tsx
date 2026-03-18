'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { Input, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface SiteSettings {
  id: number
  siteName: string
  description: string
  logoUrl: string | null
  accentColor: string
}

interface Props {
  settings: SiteSettings
}

// ─── Canvas helper ───────────────────────────────────────────────────────────

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
      )
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
        'image/png',
        0.92
      )
    }
    image.onerror = reject
    image.src = imageSrc
  })
}

// ─── Logo Crop Modal ─────────────────────────────────────────────────────────

function LogoCropModal({
  src,
  onApply,
  onCancel,
}: {
  src: string
  onApply: (blob: Blob) => void
  onCancel: () => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleApply = async () => {
    if (!croppedAreaPixels) return
    const blob = await getCroppedBlob(src, croppedAreaPixels)
    onApply(blob)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1a1a2e]">اقتصاص الشعار</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* react-easy-crop area */}
        <div className="relative w-full rounded-xl overflow-hidden bg-gray-100" style={{ height: 260 }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>تصغير</span>
            <span className="font-mono">{Math.round(zoom * 100)}%</span>
            <span>تكبير</span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full accent-[#1a1a2e]"
          />
        </div>
        <p className="text-xs text-gray-400 text-center">اسحب الصورة لضبط الموضع</p>

        <div className="flex gap-3">
          <Button type="button" variant="primary" onClick={handleApply} className="flex-1">
            تطبيق
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Form ───────────────────────────────────────────────────────────────

export default function SiteSettingsForm({ settings }: Props) {
  const [siteName, setSiteName] = useState(settings.siteName)
  const [description, setDescription] = useState(settings.description)
  const [accentColor, setAccentColor] = useState(settings.accentColor)
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '')
  const [logoPreview, setLogoPreview] = useState(settings.logoUrl || '')
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const handleFileSelected = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) setCropSrc(e.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCropApply = async (blob: Blob) => {
    setCropSrc(null)
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', blob, 'logo.png')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const json = await res.json()
        if (json.data?.url) {
          setLogoUrl(json.data.url)
          setLogoPreview(json.data.url)
        }
      } else {
        const json = await res.json().catch(() => ({}))
        setError(json.error || 'فشل رفع الشعار')
      }
    } catch {
      setError('خطأ أثناء رفع الشعار')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName, description, accentColor, logoUrl: logoUrl || null }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const json = await res.json()
        setError(json.error || 'حدث خطأ أثناء الحفظ')
      }
    } catch {
      setError('خطأ في الاتصال')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {cropSrc && (
        <LogoCropModal
          src={cropSrc}
          onApply={handleCropApply}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#1a1a2e] mb-5">هوية الموقع</h2>

        <div className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">تم الحفظ بنجاح</div>
          )}

          {/* Logo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">شعار الموقع (اختياري)</label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  <Image src={logoPreview} alt="شعار" fill className="object-contain p-1" sizes="64px" />
                  <button
                    type="button"
                    onClick={() => { setLogoUrl(''); setLogoPreview('') }}
                    className="absolute top-0.5 left-0.5 w-4 h-4 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl shrink-0 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-[#1a1a2e] font-bold text-2xl">
                  ع
                </div>
              )}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      جاري الرفع...
                    </>
                  ) : 'رفع شعار + اقتصاص'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelected(file)
                    e.target.value = ''
                  }}
                />
                <p className="text-xs text-gray-400">PNG أو SVG — ستتمكن من الاقتصاص بعد الاختيار</p>
              </div>
            </div>
          </div>

          <Input
            label="اسم الموقع"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="مثال: النشرة الأسبوعية"
          />

          <Textarea
            label="وصف الموقع"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="جملة أو جملتان عن النشرة..."
            rows={3}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">اللون الأساسي</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <span className="text-sm text-gray-500 font-mono">{accentColor}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              loading={saving}
              onClick={handleSave}
            >
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
