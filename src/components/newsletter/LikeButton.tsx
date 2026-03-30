'use client'

import { useState, useEffect } from 'react'

interface LikeButtonProps {
  newsletterId: number
  initialLikes: number
}

export default function LikeButton({ newsletterId, initialLikes }: LikeButtonProps) {
  const storageKey = `newsletter-liked-${newsletterId}`
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setLiked(localStorage.getItem(storageKey) === '1')
  }, [storageKey])

  async function handleLike() {
    if (liked) return

    setLiked(true)
    setLikes((prev) => prev + 1)
    setAnimating(true)
    localStorage.setItem(storageKey, '1')

    try {
      const res = await fetch(`/api/newsletters/${newsletterId}/like`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes)
      }
    } catch {
      // Optimistic update already applied
    }

    setTimeout(() => setAnimating(false), 600)
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`
        group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300
        ${liked
          ? 'bg-red-50 border-red-200 text-red-500 cursor-default'
          : 'bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 cursor-pointer'
        }
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={liked ? 0 : 2}
        className={`w-5 h-5 transition-transform duration-300 ${animating ? 'scale-125' : 'scale-100'}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span className="text-sm font-medium tabular-nums">{likes}</span>
    </button>
  )
}
