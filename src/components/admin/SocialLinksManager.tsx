'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface SocialLink {
  id: number
  title: string
  url: string
  platform: string | null
  iconUrl: string | null
  enabled: boolean
  sortOrder: number
}

interface Props {
  initialLinks: SocialLink[]
}

const PLATFORMS = [
  { value: 'twitter', label: 'تويتر / X' },
  { value: 'instagram', label: 'إنستغرام' },
  { value: 'youtube', label: 'يوتيوب' },
  { value: 'tiktok', label: 'تيك توك' },
  { value: 'linkedin', label: 'لينكدإن' },
  { value: 'facebook', label: 'فيسبوك' },
  { value: 'telegram', label: 'تيليغرام' },
  { value: 'whatsapp', label: 'واتساب' },
  { value: 'snapchat', label: 'سناب شات' },
  { value: 'other', label: 'أخرى' },
]

function platformLabel(value: string | null) {
  return PLATFORMS.find((p) => p.value === value)?.label ?? value ?? 'أخرى'
}

// Reusable inline link form (used for both add and edit)
function LinkForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: { title: string; url: string; platform: string }
  onSave: (values: { title: string; url: string; platform: string }) => void
  onCancel: () => void
  saving: boolean
}) {
  const [values, setValues] = useState(initial)
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">المنصة</label>
          <select
            value={values.platform}
            onChange={(e) => setValues({ ...values, platform: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">العنوان</label>
          <input
            type="text"
            value={values.title}
            onChange={(e) => setValues({ ...values, title: e.target.value })}
            placeholder="مثال: تابعني على تويتر"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">الرابط</label>
          <input
            type="url"
            dir="ltr"
            value={values.url}
            onChange={(e) => setValues({ ...values, url: e.target.value })}
            placeholder="https://"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="primary" loading={saving} onClick={() => onSave(values)}>
          حفظ
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  )
}

export default function SocialLinksManager({ initialLinks }: Props) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks)
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  // ── Toggle enable/disable ───────────────────────────────────────────────
  const handleToggle = async (id: number, enabled: boolean) => {
    const res = await fetch(`/api/social-links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !enabled }),
    })
    if (res.ok) setLinks(links.map((l) => (l.id === id ? { ...l, enabled: !enabled } : l)))
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرابط؟')) return
    const res = await fetch(`/api/social-links/${id}`, { method: 'DELETE' })
    if (res.ok) setLinks(links.filter((l) => l.id !== id))
  }

  // ── Add ─────────────────────────────────────────────────────────────────
  const handleAdd = async (values: { title: string; url: string; platform: string }) => {
    if (!values.title || !values.url) { setError('العنوان والرابط مطلوبان'); return }
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, sortOrder: links.length }),
      })
      if (res.ok) {
        const json = await res.json()
        setLinks([...links, json.data])
        setShowAdd(false)
      } else {
        const json = await res.json()
        setError(json.error || 'حدث خطأ')
      }
    } catch { setError('خطأ في الاتصال') }
    finally { setAdding(false) }
  }

  // ── Edit save ───────────────────────────────────────────────────────────
  const handleEditSave = async (id: number, values: { title: string; url: string; platform: string }) => {
    if (!values.title || !values.url) { setError('العنوان والرابط مطلوبان'); return }
    setSavingId(id)
    setError('')
    try {
      const res = await fetch(`/api/social-links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (res.ok) {
        setLinks(links.map((l) => (l.id === id ? { ...l, ...values } : l)))
        setEditingId(null)
      } else {
        const json = await res.json()
        setError(json.error || 'حدث خطأ')
      }
    } catch { setError('خطأ في الاتصال') }
    finally { setSavingId(null) }
  }

  // ── Reorder (move up / move down) ───────────────────────────────────────
  const moveLink = async (index: number, direction: -1 | 1) => {
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= links.length) return
    const updated = [...links]
    ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]
    // Assign new sortOrders
    const reordered = updated.map((l, i) => ({ ...l, sortOrder: i }))
    setLinks(reordered)
    // Persist both changed links
    await Promise.all([
      fetch(`/api/social-links/${reordered[index].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: reordered[index].sortOrder }),
      }),
      fetch(`/api/social-links/${reordered[swapIndex].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: reordered[swapIndex].sortOrder }),
      }),
    ])
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-[#1a1a2e]">روابط التواصل</h2>
        <Button type="button" variant="outline" onClick={() => { setShowAdd(!showAdd); setError('') }}>
          {showAdd ? 'إلغاء' : '+ إضافة رابط'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="mb-5">
          <LinkForm
            initial={{ title: '', url: '', platform: 'twitter' }}
            onSave={handleAdd}
            onCancel={() => { setShowAdd(false); setError('') }}
            saving={adding}
          />
        </div>
      )}

      {/* Links list */}
      {links.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">لا توجد روابط بعد. أضف رابطاً للبدء.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {links.map((link, idx) => (
            <div key={link.id}>
              {editingId === link.id ? (
                <div className="py-3">
                  <LinkForm
                    initial={{
                      title: link.title,
                      url: link.url,
                      platform: link.platform || 'other',
                    }}
                    onSave={(values) => handleEditSave(link.id, values)}
                    onCancel={() => { setEditingId(null); setError('') }}
                    saving={savingId === link.id}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 py-3">
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveLink(idx, -1)}
                      disabled={idx === 0}
                      className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-500 disabled:opacity-30 transition-colors"
                      title="أعلى"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLink(idx, 1)}
                      disabled={idx === links.length - 1}
                      className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-500 disabled:opacity-30 transition-colors"
                      title="أسفل"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Platform badge */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${link.enabled ? 'bg-[#1a1a2e]' : 'bg-gray-300'}`}>
                    {(link.platform || 'o').charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{link.title}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {platformLabel(link.platform)}
                      </span>
                      <span className="text-xs text-gray-400 truncate" dir="ltr">{link.url}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggle(link.id, link.enabled)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${link.enabled ? 'bg-[#1a1a2e]' : 'bg-gray-200'}`}
                      title={link.enabled ? 'إخفاء' : 'إظهار'}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${link.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => { setEditingId(link.id); setError('') }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors"
                      title="تعديل"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(link.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="حذف"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
