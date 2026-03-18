'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { NewsletterListItem } from '@/types'

interface NewsletterTableProps {
  newsletters: NewsletterListItem[]
}

export default function NewsletterTable({ newsletters }: NewsletterTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/newsletters/${id}`, { method: 'DELETE' })
      if (res.ok) {
        startTransition(() => {
          router.refresh()
        })
      }
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  const handleToggleStatus = async (
    id: number,
    currentStatus: string
  ) => {
    setTogglingId(id)
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/newsletters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        startTransition(() => {
          router.refresh()
        })
      }
    } finally {
      setTogglingId(null)
    }
  }

  if (newsletters.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-4xl mb-3">📝</div>
        <p>لا توجد نشرات بعد</p>
        <Link
          href="/admin/newsletters/new"
          className="mt-3 inline-block text-[#e63946] font-medium hover:underline"
        >
          أنشئ أول نشرة
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-lg mb-2">حذف النشرة</h3>
            <p className="text-gray-500 text-sm mb-5">
              هل أنت متأكد من حذف هذه النشرة؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                size="sm"
                loading={deletingId === confirmDelete}
                onClick={() => handleDelete(confirmDelete)}
              >
                نعم، احذف
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(null)}
                disabled={deletingId !== null}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-start py-3 px-4 text-gray-500 font-medium">
                العنوان
              </th>
              <th className="text-start py-3 px-4 text-gray-500 font-medium">
                الحالة
              </th>
              <th className="text-start py-3 px-4 text-gray-500 font-medium">
                التاريخ
              </th>
              <th className="text-start py-3 px-4 text-gray-500 font-medium">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map((nl) => (
              <tr
                key={nl.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-[#1a1a2e] line-clamp-1 max-w-xs">
                    {nl.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                    {nl.description}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge status={nl.status as 'draft' | 'published'} />
                </td>
                <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                  {formatDate(nl.publishedAt || nl.createdAt)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {/* View (if published) */}
                    {nl.status === 'published' && (
                      <Link
                        href={`/newsletter/${nl.slug}`}
                        target="_blank"
                        className="text-gray-400 hover:text-[#1a1a2e] transition-colors p-1"
                        title="عرض"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    )}

                    {/* Edit */}
                    <Link
                      href={`/admin/newsletters/${nl.id}`}
                      className="text-gray-400 hover:text-[#1a1a2e] transition-colors p-1"
                      title="تعديل"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>

                    {/* Toggle status */}
                    <button
                      onClick={() => handleToggleStatus(nl.id, nl.status)}
                      disabled={togglingId === nl.id || isPending}
                      className="text-gray-400 hover:text-emerald-600 transition-colors p-1 disabled:opacity-50"
                      title={nl.status === 'published' ? 'تحويل لمسودة' : 'نشر'}
                    >
                      {togglingId === nl.id ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : nl.status === 'published' ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setConfirmDelete(nl.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="حذف"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
