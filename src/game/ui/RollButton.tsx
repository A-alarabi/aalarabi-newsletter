'use client'

import { useGameStore } from '@/game/engine/store'
import { Actions } from '@/game/engine/actions'
import { sounds } from '@/game/audio/SoundManager'

export function RollButton() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)

  if (state.phase !== 'awaiting_roll') return null
  const current = state.players[state.currentPlayerIndex]

  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
      <div className="text-white/80 text-sm font-bold tracking-wide">
        {current.name}, roll to move
      </div>
      <button
        onClick={() => {
          sounds.play('dice')
          dispatch(Actions.rollDice())
        }}
        className="px-12 py-5 rounded-3xl bg-gradient-to-b from-amber-300 to-amber-500 text-slate-900 font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-transform game-pulse"
      >
        🎲 ROLL DICE
      </button>
    </div>
  )
}
