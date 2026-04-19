'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/game/engine/store'
import { getBoard } from '@/game/boards/registry'
import { spaceById } from '@/game/boards/boardLogic'
import type { SpaceType } from '@/game/engine/types'

const MESSAGES: Record<SpaceType, { text: string; color: string } | null> = {
  blue: { text: '+3 coins', color: '#3b82f6' },
  red: { text: '-3 coins', color: '#ef4444' },
  chance: { text: 'Chance!', color: '#10b981' },
  star: { text: 'Star!', color: '#ffd700' },
  minigame: { text: 'Mini-game!', color: '#a855f7' },
  start: null,
}

export function SpaceResolveToast() {
  const phase = useGameStore((s) => s.state.phase)
  const turnNumber = useGameStore((s) => s.state.turnNumber)
  const currentPlayerIndex = useGameStore((s) => s.state.currentPlayerIndex)
  const [visible, setVisible] = useState<{ text: string; color: string } | null>(
    null
  )
  const lastKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (phase !== 'space_resolve') {
      setVisible(null)
      return
    }
    const key = `${turnNumber}-${currentPlayerIndex}`
    if (lastKeyRef.current === key) return
    lastKeyRef.current = key
    const s = useGameStore.getState().state
    const board = getBoard(s.boardId)
    const current = s.players[s.currentPlayerIndex]
    const space = spaceById(board, current.spaceId)
    const msg = MESSAGES[space.type]
    if (msg) setVisible(msg)
    const t = setTimeout(() => setVisible(null), 1200)
    return () => clearTimeout(t)
  }, [phase, turnNumber, currentPlayerIndex])

  if (!visible) return null

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-20">
      <div
        className="px-6 py-3 rounded-2xl font-black text-2xl game-pop-in shadow-2xl"
        style={{
          background: visible.color,
          color: visible.color === '#ffd700' ? '#0a0a1a' : 'white',
        }}
      >
        {visible.text}
      </div>
    </div>
  )
}
