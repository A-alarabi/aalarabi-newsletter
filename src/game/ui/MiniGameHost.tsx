'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '@/game/engine/store'
import { Actions } from '@/game/engine/actions'
import { getMiniGame } from '@/game/minigames/registry'
import { createRNG } from '@/game/engine/rng'

export function MiniGameHost() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const active = state.activeMiniGame

  const game = useMemo(() => (active ? getMiniGame(active.id) : null), [active])
  const config = useMemo(() => {
    if (!game || !active) return null
    const rng = createRNG(active.seed)
    return game.buildConfig(rng, state.players)
  }, [game, active, state.players])

  const [introVisible, setIntroVisible] = useState(false)

  useEffect(() => {
    if (state.phase === 'minigame_intro') {
      setIntroVisible(true)
      const t = setTimeout(() => {
        setIntroVisible(false)
        dispatch(Actions.minigameIntroDone())
      }, 2200)
      return () => clearTimeout(t)
    }
  }, [state.phase, dispatch])

  if (!active || !game || !config) return null

  if (state.phase === 'minigame_intro' && introVisible) {
    return (
      <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center z-40">
        <div className="flex flex-col items-center gap-3 game-pop-in">
          <div className="text-white/60 text-sm uppercase tracking-[0.4em]">
            Mini-game
          </div>
          <div className="text-white text-7xl md:text-8xl font-black game-shake">
            {game.displayName.toUpperCase()}
          </div>
          <div className="text-white/70 text-lg max-w-xl text-center px-4">
            {game.description}
          </div>
        </div>
      </div>
    )
  }

  if (state.phase === 'minigame_active') {
    const localPlayerId = state.players[state.currentPlayerIndex].id
    const View = game.View
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 z-40">
        <View
          players={state.players}
          localPlayerId={localPlayerId}
          config={config}
          onComplete={(scoresByPlayer) => {
            const result = game.scoresToResult(scoresByPlayer, state.players)
            dispatch(Actions.submitMinigameResult(result))
          }}
        />
      </div>
    )
  }

  if (state.phase === 'minigame_payout') {
    const last = state.players
    return (
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-40">
        <div className="flex flex-col items-center gap-4 game-pop-in max-w-md">
          <div className="text-white/70 text-sm uppercase tracking-widest">Results</div>
          <div className="text-white text-4xl font-black">{game.displayName}</div>
          <div className="w-full mt-4 space-y-2">
            {[...last]
              .sort((a, b) => b.coins - a.coins)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white/60"
                      style={{ background: p.color }}
                    />
                    <div className="text-white font-bold">{p.name}</div>
                  </div>
                  <div className="text-amber-300 font-bold">¢ {p.coins}</div>
                </div>
              ))}
          </div>
          <button
            onClick={() => dispatch(Actions.endTurn())}
            className="mt-4 px-10 py-3 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform"
          >
            Continue →
          </button>
        </div>
      </div>
    )
  }

  return null
}
