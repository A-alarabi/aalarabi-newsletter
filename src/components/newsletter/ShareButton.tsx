'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title: string
  description: string
  slug: string
  coverImage?: string | null
}

async function generateShareImage(
  title: string,
  coverImage?: string | null
): Promise<File> {
  const WIDTH = 1080
  const HEIGHT = 1920
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  grad.addColorStop(0, '#1a1a2e')
  grad.addColorStop(1, '#16213e')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  let imageY = 280

  // Cover image
  if (coverImage) {
    try {
      const img = await loadImage(coverImage)
      const imgW = WIDTH - 120
      const imgH = 700
      const x = 60
      const y = imageY
      const radius = 32

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + imgW - radius, y)
      ctx.quadraticCurveTo(x + imgW, y, x + imgW, y + radius)
      ctx.lineTo(x + imgW, y + imgH - radius)
      ctx.quadraticCurveTo(x + imgW, y + imgH, x + imgW - radius, y + imgH)
      ctx.lineTo(x + radius, y + imgH)
      ctx.quadraticCurveTo(x, y + imgH, x, y + imgH - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      ctx.clip()

      // Cover the area maintaining aspect ratio
      const scale = Math.max(imgW / img.width, imgH / img.height)
      const sw = imgW / scale
      const sh = imgH / scale
      const sx = (img.width - sw) / 2
      const sy = (img.height - sh) / 2
      ctx.drawImage(img, sx, sy, sw, sh, x, y, imgW, imgH)
      ctx.restore()

      imageY = y + imgH + 80
    } catch {
      imageY = 400
    }
  } else {
    imageY = 400
  }

  // Title text (RTL Arabic)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.direction = 'rtl'

  const fontSize = title.length > 40 ? 56 : 68
  ctx.font = `bold ${fontSize}px -apple-system, "SF Pro Display", "Segoe UI", sans-serif`

  const lines = wrapText(ctx, title, WIDTH - 140)
  const lineHeight = fontSize * 1.4
  const textStartY = imageY + 40

  lines.forEach((line, i) => {
    ctx.fillText(line, WIDTH / 2, textStartY + i * lineHeight)
  })

  // Accent line
  const accentY = textStartY + lines.length * lineHeight + 40
  ctx.fillStyle = '#e63946'
  ctx.fillRect(WIDTH / 2 - 60, accentY, 120, 6)

  // Branding
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '32px -apple-system, "SF Pro Display", "Segoe UI", sans-serif'
  ctx.fillText('العربي', WIDTH / 2, HEIGHT - 100)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], 'newsletter-share.png', { type: 'image/png' }))
    }, 'image/png')
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)

  return lines.slice(0, 4) // Max 4 lines
}

export default function ShareButton({ title, description, slug, coverImage }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/newsletter/${slug}`

    if (navigator.share) {
      setLoading(true)
      try {
        const file = await generateShareImage(title, coverImage)
        const canShareFiles = navigator.canShare?.({ files: [file] })

        if (canShareFiles) {
          await navigator.share({
            title,
            text: `${description}\n\n${url}`,
            files: [file],
          })
        } else {
          await navigator.share({ title, text: description, url })
        }
      } catch {
        // User cancelled or error
      } finally {
        setLoading(false)
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
      disabled={loading}
      className="group flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer disabled:opacity-50"
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
        {loading ? '...' : copied ? 'تم النسخ!' : 'مشاركة'}
      </span>
    </button>
  )
}
