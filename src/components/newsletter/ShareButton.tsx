'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title: string
  description: string
  slug: string
}

export default function ShareButton({ title, description, slug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/newsletter/${slug}`

    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url })
      } catch {
        // User cancelled share
      }
      return
    }

    // Fallback: copy link
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="group flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186zm0 12.814a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186z"
        />
      </svg>
      <span className="text-sm font-medium">
        {copied ? 'تم النسخ!' : 'مشاركة'}
      </span>
    </button>
  )
}
