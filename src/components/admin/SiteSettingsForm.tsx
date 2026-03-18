'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
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

// ─── Logo Crop Modal ────────────────────────────────────────────────────────
const FRAME = 200 // crop frame px

function LogoCropModal({
  src,
  onApply,
  onCancel,
}: {
  src: string
  onApply: (blob: Blob) => void
  onCancel: () => void
}) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })

  // Load natural dimensions
  useEffect(() => {
    const img = new window.Image()
    img.onload = () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
      imgRef.current = img
      // Start scale so the shorter side fills the frame
      const fit = Math.max(FRAME / img.naturalWidth, FRAME / img.naturalHeight)
      setScale(parseFloat(fit.toFixed(2)))
      setOffset({ x: 0, y: 0 })
    }
    img.src = src
  }, [src])

  const clampOffset = useCallback(
    (ox: number, oy: number, s: number) => {
      const dw = imgSize.w * s
      const dh = imgSize.h * s
      const maxX = Math.max(0, (dw - FRAME) / 2)
      const maxY = Math.max(0, (dh - FRAME) / 2)
      return {
        x: Math.min(maxX, Math.max(-maxX, ox)),
        y: Math.min(maxY, Math.max(-maxY, oy)),
      }
    },
    [imgSize]
  )

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging || !dragStart.current) return
      const dx = e.clientX - dragStart.current.mx
      const dy = e.clientY - dragStart.current.my
      setOffset(clampOffset(dragStart.current.ox - dx, dragStart.current.oy - dy, scale))
    },
    [dragging, scale, clampOffset]
  )
  const onMouseUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  const handleScaleChange = (newScale: number) => {
    setScale(newScale)
    setOffset((o) => clampOffset(o.x, o.y, newScale))
  }

  const handleApply = () => {
    if (!imgRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = FRAME
    canvas.height = FRAME
    const ctx = canvas.getContext('2d')!
    const dw = imgSize.w * scale
    const dh = imgSize.h * scale
    const sx = (dw - FRAME) / 2 - offset.x
    const sy = (dh - FRAME) / 2 - offset.y
    // Draw scaled image, offset so the visible area is centred
    ctx.drawImage(imgRef.current, -sx / scale, -sy / scale, imgSize.w, imgSize.h, 0, 0, dw, dh)
    canvas.toBlob((blob) => blob && onApply(blob), 'image/png', 0.92)
  }

  const dw = imgSize.w * scale
  const dh = imgSize.h * scale

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1a1a2e]">اقتصاص الشعار</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Crop frame */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative overflow-hidden rounded-xl border-2 border-[#1a1a2e] cursor-grab active:cursor-grabbing select-none"
            style={{ width: FRAME, height: FRAME }}
            onMouseDown={onMouseDown}
          >
            {imgSize.w > 0 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt="crop"
                draggable={false}
                style={{
                  position: 'absolute',
                  width: dw,
                  height: dh,
                  top: '50%',
                  left: '50%',
                  transform: `translate(calc(-50% + ${-offset.x}px), calc(-50% + ${-offset.y}px))`,
                  pointerEvents: 'none',
                }}
              />
            )}
            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)',
              backgroundSize: `${FRAME/3}px ${FRAME/3}px`,
            }} />
          </div>

          {/* Scale slider */}
          <div className="w-full flex flex-col gap-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>تصغير</span>
              <span className="font-mono">{Math.round(scale * 100)}%</span>
              <span>تكبير</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={3}
              step={0.05}
              value={scale}
              onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
              className="w-full accent-[#1a1a2e]"
            />
          </div>
          <p className="text-xs text-gray-400">اسحب الصورة لضبط الموضع</p>
        </div>

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

// ─── Main Form ──────────────────────────────────────────────────────────────

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

  // Crop modal state
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
        setError('فشل رفع الشعار')
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
