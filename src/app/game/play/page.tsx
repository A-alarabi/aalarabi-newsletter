'use client'

import dynamic from 'next/dynamic'
import '@/game/boards'       // register boards
import '@/game/minigames'    // register mini-games

const GameRoot = dynamic(
  () => import('@/game/ui/GameRoot').then((m) => m.GameRoot),
  { ssr: false }
)

export default function PlayPage() {
  return <GameRoot />
}
