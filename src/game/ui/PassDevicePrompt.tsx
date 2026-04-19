'use client'

import { useGameStore } from '@/game/engine/store'
import { Actions } from '@/game/engine/actions'

export function PassDevicePrompt() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)

  if (state.phase !== 'intro') return null
  const current = state.players[state.currentPlayerIndex]

  return (
    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-30">
      <div className="flex flex-col items-center gap-6 game-pop-in">
        <div className="text-6xl">📱</div>
        <div className="text-white/70 text-sm uppercase tracking-[0.3em]">
          Pass device to
        </div>
        <div
          className="px-10 py-5 rounded-2xl text-5xl font-black shadow-2xl"
          style={{ background: current.color, color: '#0a0a1a' }}
        >
          {current.name}
        </div>
        <div className="text-white/50 text-sm">
          Turn {state.turnNumber} of {state.totalTurns}
        </div>
        <button
          onClick={() => dispatch(Actions.startTurn())}
          className="mt-4 px-12 py-4 bg-white text-slate-900 rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-transform"
        >
          I&apos;m ready →
        </button>
      </div>
    </div>
  )
}
