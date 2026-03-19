'use client'

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useRef, useCallback, useState } from 'react'

type Align = 'right' | 'center' | 'left'
type FloatMode = 'none' | 'right' | 'left'

export default function ResizableImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const attrs = node.attrs as {
    src: string
    alt?: string
    title?: string
    align?: Align
    float?: FloatMode
    width?: string | null
  }

  const { src, alt, align = 'center', float: floatMode = 'none', width } = attrs
  const innerRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [liveWidth, setLiveWidth] = useState<string | null>(null)

  // ── Resize ──────────────────────────────────────────────────────────────────
  const startResize = useCallback(
    (e: React.MouseEvent, direction: 'right' | 'left') => {
      e.preventDefault()
      e.stopPropagation()

      const startX = e.clientX
      const startW = innerRef.current?.offsetWidth ?? 300

      setIsResizing(true)

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX
        const newW = direction === 'right'
          ? Math.max(60, startW + dx)
          : Math.max(60, startW - dx)
        const wStr = `${Math.round(newW)}px`
        setLiveWidth(wStr)
        updateAttributes({ width: wStr })
      }

      const onUp = () => {
        setIsResizing(false)
        setLiveWidth(null)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [updateAttributes]
  )

  // ── Container styles ─────────────────────────────────────────────────────────
  const outerStyle: React.CSSProperties = (() => {
    const w = width ? { width } : {}
    if (floatMode === 'right') {
      return {
        float: 'right',
        margin: '0.25rem 0 1rem 1.5rem',
        maxWidth: '65%',
        minWidth: 60,
        display: 'inline-block',
        position: 'relative',
        ...w,
      }
    }
    if (floatMode === 'left') {
      return {
        float: 'left',
        margin: '0.25rem 1.5rem 1rem 0',
        maxWidth: '65%',
        minWidth: 60,
        display: 'inline-block',
        position: 'relative',
        ...w,
      }
    }
    // No float — block with alignment
    const marginMap: Record<Align, React.CSSProperties> = {
      right:  { marginRight: 0, marginLeft: 'auto' },
      center: { marginLeft: 'auto', marginRight: 'auto' },
      left:   { marginLeft: 0, marginRight: 'auto' },
    }
    return {
      display: 'block',
      position: 'relative',
      ...marginMap[align],
      ...w,
    }
  })()

  const handleBase: React.CSSProperties = {
    position: 'absolute',
    width: 10,
    height: 10,
    background: '#1a1a2e',
    border: '2px solid #fff',
    borderRadius: 2,
    zIndex: 20,
  }

  const displayWidth = liveWidth ?? width

  return (
    <NodeViewWrapper as="div" style={outerStyle}>
      {/* Inner wrapper — used for width measurement and selection ring */}
      <div
        ref={innerRef}
        style={{
          position: 'relative',
          display: 'block',
          outline: selected ? '2px solid #1a1a2e' : 'none',
          outlineOffset: 2,
          borderRadius: 8,
        }}
      >
        {/* The image itself */}
        <img
          src={src}
          alt={alt ?? ''}
          draggable={false}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: 8,
            userSelect: 'none',
            pointerEvents: isResizing ? 'none' : 'auto',
          }}
        />

        {/* Resize handles — only when selected */}
        {selected && (
          <>
            {/* Top-right */}
            <div
              onMouseDown={(e) => startResize(e, 'right')}
              style={{ ...handleBase, top: -5, right: -5, cursor: 'ne-resize' }}
            />
            {/* Top-left */}
            <div
              onMouseDown={(e) => startResize(e, 'left')}
              style={{ ...handleBase, top: -5, left: -5, cursor: 'nw-resize' }}
            />
            {/* Bottom-right */}
            <div
              onMouseDown={(e) => startResize(e, 'right')}
              style={{ ...handleBase, bottom: -5, right: -5, cursor: 'se-resize' }}
            />
            {/* Bottom-left */}
            <div
              onMouseDown={(e) => startResize(e, 'left')}
              style={{ ...handleBase, bottom: -5, left: -5, cursor: 'sw-resize' }}
            />
            {/* Middle-right */}
            <div
              onMouseDown={(e) => startResize(e, 'right')}
              style={{ ...handleBase, top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'ew-resize' }}
            />
            {/* Middle-left */}
            <div
              onMouseDown={(e) => startResize(e, 'left')}
              style={{ ...handleBase, top: '50%', left: -5, transform: 'translateY(-50%)', cursor: 'ew-resize' }}
            />

            {/* Live width tooltip */}
            {isResizing && displayWidth && (
              <div style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.72)',
                color: '#fff',
                fontSize: 11,
                fontFamily: 'monospace',
                padding: '2px 8px',
                borderRadius: 4,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}>
                {displayWidth}
              </div>
            )}
          </>
        )}
      </div>
    </NodeViewWrapper>
  )
}
