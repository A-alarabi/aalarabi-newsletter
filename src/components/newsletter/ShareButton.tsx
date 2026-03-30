'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title: string
  description: string
  slug: string
  coverImage?: string | null
  logoUrl?: string | null
}

async function generateShareImage(
  title: string,
  description: string,
  coverImage?: string | null,
  logoUrl?: string | null
): Promise<File> {
  const WIDTH = 1080
  const HEIGHT = 1920
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')!

  // Background — clean white
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // Top accent bar
  ctx.fillStyle = '#e63946'
  ctx.fillRect(0, 0, WIDTH, 12)

  // "النشرة الأسبوعية" branding at top
  ctx.fillStyle = '#1a1a2e'
  ctx.textAlign = 'center'
  ctx.direction = 'rtl'
  ctx.font = 'bold 42px -apple-system, "SF Pro Display", "Segoe UI", sans-serif'
  ctx.fillText('النشرة الأسبوعية', WIDTH / 2, 100)

  // Thin separator under branding
  ctx.fillStyle = '#e63946'
  ctx.fillRect(WIDTH / 2 - 40, 130, 80, 4)

  let contentY = 200

  // Cover image
  if (coverImage) {
    try {
      const img = await loadImage(coverImage)
      const imgW = WIDTH - 120
      const imgH = 680
      const x = 60
      const y = contentY
      const radius = 24

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

      const scale = Math.max(imgW / img.width, imgH / img.height)
      const sw = imgW / scale
      const sh = imgH / scale
      const sx = (img.width - sw) / 2
      const sy = (img.height - sh) / 2
      ctx.drawImage(img, sx, sy, sw, sh, x, y, imgW, imgH)
      ctx.restore()

      contentY = y + imgH + 60
    } catch {
      contentY = 300
    }
  } else {
    contentY = 300
  }

  // Title
  ctx.fillStyle = '#1a1a2e'
  ctx.textAlign = 'right'
  ctx.direction = 'rtl'

  const titleSize = title.length > 40 ? 52 : 62
  ctx.font = `bold ${titleSize}px -apple-system, "SF Pro Display", "Segoe UI", sans-serif`

  const titleLines = wrapText(ctx, title, WIDTH - 160)
  const titleLineHeight = titleSize * 1.5

  titleLines.forEach((line, i) => {
    ctx.fillText(line, WIDTH - 80, contentY + i * titleLineHeight)
  })

  contentY += titleLines.length * titleLineHeight + 20

  // Red accent line beside description
  const descStartY = contentY
  ctx.fillStyle = '#e63946'
  ctx.fillRect(WIDTH - 80, descStartY - 4, 4, 0) // placeholder, drawn after desc

  // Description
  ctx.fillStyle = '#6b7280'
  ctx.font = '36px -apple-system, "SF Pro Display", "Segoe UI", sans-serif'

  const descLines = wrapText(ctx, description, WIDTH - 200)
  const descLineHeight = 36 * 1.7
  const maxDescLines = Math.min(descLines.length, 5)

  // Draw accent bar on the right side of description
  const descBlockHeight = maxDescLines * descLineHeight
  ctx.fillStyle = '#e63946'
  ctx.fillRect(WIDTH - 80, descStartY, 4, descBlockHeight - 10)

  ctx.fillStyle = '#6b7280'
  ctx.textAlign = 'right'
  for (let i = 0; i < maxDescLines; i++) {
    let line = descLines[i]
    if (i === maxDescLines - 1 && descLines.length > maxDescLines) {
      line = line + '...'
    }
    ctx.fillText(line, WIDTH - 100, descStartY + i * descLineHeight + 36)
  }

  // Bottom branding area
  // Accent bar at bottom
  ctx.fillStyle = '#e63946'
  ctx.fillRect(0, HEIGHT - 12, WIDTH, 12)

  // Logo
  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl)
      const maxH = 100
      const scale = maxH / logo.height
      const logoW = logo.width * scale
      ctx.drawImage(logo, (WIDTH - logoW) / 2, HEIGHT - 150, logoW, maxH)
    } catch {
      // Fallback text if logo fails to load
      ctx.fillStyle = '#1a1a2e'
      ctx.textAlign = 'center'
      ctx.font = 'bold 40px -apple-system, "SF Pro Display", "Segoe UI", sans-serif'
      ctx.fillText('النشرة الأسبوعية', WIDTH / 2, HEIGHT - 90)
    }
  }

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

  return lines.slice(0, 6)
}

export default function ShareButton({ title, description, slug, coverImage, logoUrl }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/newsletter/${slug}`

    if (navigator.share) {
      setLoading(true)
      try {
        const file = await generateShareImage(title, description, coverImage, logoUrl)
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
