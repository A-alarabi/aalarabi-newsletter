'use client'

import { useGameStore } from '@/game/engine/store'
import type { Player } from '@/game/engine/types'

export function HUD() {
  const state = useGameStore((s) => s.state)
  if (state.players.length === 0) return null

  return (
    <>
      {/* Top bar: turn counter */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur rounded-full text-white font-bold text-sm tracking-wide">
        TURN {state.turnNumber} / {state.totalTurns}
      </div>

      {/* Player portraits along bottom (or side on wide) */}
      <div className="absolute bottom-3 left-3 right-3 flex gap-2 justify-center pointer-events-none">
        {state.players.map((p, i) => (
          <PlayerCard
            key={p.id}
            player={p}
            isActive={i === state.currentPlayerIndex}
          />
        ))}
      </div>
    </>
  )
}

function PlayerCard({ player, isActive }: { player: Player; isActive: boolean }) {
  return (
    <div
      className={`px-3 py-2 rounded-xl backdrop-blur flex items-center gap-3 transition-all ${
        isActive
          ? 'bg-white/25 scale-105 ring-2 ring-white/60 shadow-lg'
          : 'bg-black/50'
      }`}
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-white/70"
        style={{ background: player.color }}
      />
      <div className="flex flex-col text-white leading-tight">
        <div className="text-sm font-bold max-w-[90px] truncate">{player.name}</div>
        <div className="flex gap-2 text-xs">
          <span className="text-yellow-300 font-bold">★ {player.stars}</span>
          <span className="text-amber-300 font-bold">¢ {player.coins}</span>
        </div>
      </div>
    </div>
  )
}
