'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGameStore } from '@/game/engine/store'
import { Actions } from '@/game/engine/actions'
import { listBoards } from '@/game/boards/registry'
import { randomSeed } from '@/game/engine/rng'
import type { CharacterId } from '@/game/engine/types'
import '@/game/boards'        // register boards
import '@/game/minigames'     // register mini-games

const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308']
const CHARACTERS: { id: CharacterId; label: string; emoji: string }[] = [
  { id: 'fox', label: 'Fox', emoji: '🦊' },
  { id: 'bear', label: 'Bear', emoji: '🐻' },
  { id: 'panda', label: 'Panda', emoji: '🐼' },
  { id: 'rabbit', label: 'Rabbit', emoji: '🐰' },
]
const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4']

export default function SetupPage() {
  const router = useRouter()
  const dispatch = useGameStore((s) => s.dispatch)
  const reset = useGameStore((s) => s.reset)
  const boards = listBoards()

  const [playerCount, setPlayerCount] = useState(2)
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES)
  const [characters, setCharacters] = useState<CharacterId[]>([
    'fox',
    'bear',
    'panda',
    'rabbit',
  ])
  const [boardId, setBoardId] = useState<string>(boards[0]?.id ?? '')
  const [turnCount, setTurnCount] = useState<number>(
    boards[0]?.recommendedTurnCount ?? 10
  )

  function start() {
    const board = boards.find((b) => b.id === boardId)
    if (!board) return
    reset()
    dispatch(
      Actions.init({
        seed: randomSeed(),
        boardId: board.id,
        totalTurns: turnCount,
        startSpaceId: board.startSpaceId,
        players: Array.from({ length: playerCount }, (_, i) => ({
          id: `p${i + 1}`,
          name: names[i] || DEFAULT_NAMES[i],
          character: characters[i],
          color: PLAYER_COLORS[i],
        })),
      })
    )
    router.push('/game/play')
  }

  const board = boards.find((b) => b.id === boardId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/game" className="text-white/60 hover:text-white">
            ← Back
          </Link>
          <h1 className="text-2xl font-black text-white">Setup</h1>
          <div className="w-12" />
        </div>

        <section className="mb-8">
          <h2 className="text-white/70 uppercase tracking-widest text-xs mb-3">
            Board
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {boards.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setBoardId(b.id)
                  setTurnCount(b.recommendedTurnCount)
                }}
                className={`text-left p-5 rounded-2xl border-2 transition-all ${
                  boardId === b.id
                    ? 'bg-white/20 border-amber-300 scale-[1.02]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-lg font-bold text-white">
                  {b.displayName}
                </div>
                <div className="text-sm text-white/70 mt-1">
                  {b.description}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-white/70 uppercase tracking-widest text-xs mb-3">
            Players: {playerCount}
          </h2>
          <div className="flex gap-2 mb-4">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                  playerCount === n
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {n} players
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {Array.from({ length: playerCount }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/5 p-3 rounded-xl"
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-white/50 flex-shrink-0"
                  style={{ background: PLAYER_COLORS[i] }}
                />
                <input
                  type="text"
                  value={names[i]}
                  onChange={(e) => {
                    const ns = [...names]
                    ns[i] = e.target.value
                    setNames(ns)
                  }}
                  maxLength={14}
                  placeholder={DEFAULT_NAMES[i]}
                  className="flex-1 bg-white/10 text-white rounded-lg px-3 py-2 outline-none focus:bg-white/20 placeholder-white/30"
                />
                <div className="flex gap-1">
                  {CHARACTERS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        const cs = [...characters]
                        cs[i] = c.id
                        setCharacters(cs)
                      }}
                      className={`w-10 h-10 rounded-lg text-2xl transition-all ${
                        characters[i] === c.id
                          ? 'bg-white scale-110'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                      title={c.label}
                    >
                      {c.emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-white/70 uppercase tracking-widest text-xs mb-3">
            Turns: {turnCount}
          </h2>
          <input
            type="range"
            min={5}
            max={20}
            value={turnCount}
            onChange={(e) => setTurnCount(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
          <div className="text-white/60 text-sm mt-1">
            ~{Math.round(turnCount * 0.8)} minutes
          </div>
        </section>

        <button
          onClick={start}
          disabled={!board}
          className="w-full py-5 bg-gradient-to-b from-amber-300 to-amber-500 text-slate-900 rounded-3xl font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50"
        >
          ▶ Start game
        </button>
      </div>
    </div>
  )
}
