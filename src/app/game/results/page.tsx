'use client'

import dynamic from 'next/dynamic'

const WinnerScreen = dynamic(
  () => import('@/game/ui/WinnerScreen').then((m) => m.WinnerScreen),
  { ssr: false }
)

export default function ResultsPage() {
  return <WinnerScreen />
}
