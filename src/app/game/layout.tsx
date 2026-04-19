import type { Metadata } from 'next'
import './game.css'

export const metadata: Metadata = {
  title: 'Party Blitz',
  description: 'A Mario Party-style board game with Kahoot-style mini-games',
}

export default function GameLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div dir="ltr" className="game-root min-h-screen w-full bg-slate-900 text-white overflow-hidden">
      {children}
    </div>
  )
}
