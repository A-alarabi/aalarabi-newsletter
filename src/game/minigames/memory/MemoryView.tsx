'use client'

import { useEffect, useRef, useState } from 'react'
import type { MiniGameProps } from '../types'
import type { PlayerId } from '@/game/engine/types'

export interface MemoryConfig {
  startLength: number
  maxLength: number
  flashMs: number
  gapMs: number
}

type Phase = 'pass_device' | 'watch' | 'input' | 'result' | 'done'

const PADS = [
  { color: '#22c55e', hi: '#86efac', label: 'GREEN' },  // 0
  { color: '#ef4444', hi: '#fca5a5', label: 'RED' },    // 1
  { color: '#3b82f6', hi: '#93c5fd', label: 'BLUE' },   // 2
  { color: '#eab308', hi: '#fde047', label: 'YELLOW' }, // 3
]

function randSeq(len: number, rng: () => number): number[] {
  return Array.from({ length: len }, () => Math.floor(rng() * 4))
}

export function MemoryView({
  players,
  config,
  onComplete,
}: MiniGameProps<MemoryConfig>) {
  const [playerIdx, setPlayerIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('pass_device')
  const [sequence, setSequence] = useState<number[]>([])
  const [flashIdx, setFlashIdx] = useState<number | null>(null)
  const [inputIdx, setInputIdx] = useState(0)
  const [currentLength, setCurrentLength] = useState(config.startLength)
  const [success, setSuccess] = useState<boolean | null>(null)
  const scores = useRef<Record<PlayerId, number>>(
    Object.fromEntries(players.map((p) => [p.id, 0]))
  )
  const rngState = useRef(Math.random)

  const currentPlayer = players[playerIdx]

  // Play sequence flash
  useEffect(() => {
    if (phase !== 'watch' || sequence.length === 0) return
    let i = 0
    let cancelled = false
    const play = () => {
      if (cancelled) return
      if (i >= sequence.length) {
        setFlashIdx(null)
        setPhase('input')
        return
      }
      setFlashIdx(sequence[i])
      setTimeout(() => {
        setFlashIdx(null)
        setTimeout(() => {
          i++
          play()
        }, config.gapMs)
      }, config.flashMs)
    }
    const startTimer = setTimeout(play, 500)
    return () => {
      cancelled = true
      clearTimeout(startTimer)
    }
  }, [phase, sequence, config.flashMs, config.gapMs])

  function startRound() {
    const seq = randSeq(currentLength, rngState.current)
    setSequence(seq)
    setInputIdx(0)
    setSuccess(null)
    setPhase('watch')
  }

  function tap(pad: number) {
    if (phase !== 'input') return
    if (pad !== sequence[inputIdx]) {
      // Fail - score = length they successfully reached (sequence length before failing)
      scores.current[currentPlayer.id] = Math.max(
        scores.current[currentPlayer.id],
        currentLength - 1
      )
      setSuccess(false)
      setPhase('result')
      return
    }
    const nextIdx = inputIdx + 1
    if (nextIdx >= sequence.length) {
      // Success - score is length achieved, advance or end
      scores.current[currentPlayer.id] = Math.max(
        scores.current[currentPlayer.id],
        currentLength
      )
      if (currentLength >= config.maxLength) {
        setSuccess(true)
        setPhase('result')
        return
      }
      // Next round, longer sequence
      setCurrentLength((l) => l + 1)
      setTimeout(() => {
        const seq = randSeq(currentLength + 1, rngState.current)
        setSequence(seq)
        setInputIdx(0)
        setPhase('watch')
      }, 600)
      return
    }
    setInputIdx(nextIdx)
  }

  function next() {
    const nextPlayerIdx = playerIdx + 1
    if (nextPlayerIdx < players.length) {
      setPlayerIdx(nextPlayerIdx)
      setCurrentLength(config.startLength)
      setPhase('pass_device')
      return
    }
    setPhase('done')
    onComplete({ ...scores.current })
  }

  if (phase === 'pass_device') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 gap-6">
        <div className="text-6xl game-pop-in">🧠</div>
        <div className="text-3xl font-bold">Pass device to</div>
        <div
          className="px-8 py-4 rounded-2xl text-4xl font-black game-pulse shadow-2xl"
          style={{ background: currentPlayer.color, color: '#0a0a1a' }}
        >
          {currentPlayer.name}
        </div>
        <p className="text-white/70 max-w-md text-center">
          Watch the pattern, then tap the pads in the same order. Each correct
          sequence makes it longer!
        </p>
        <button
          onClick={startRound}
          className="mt-4 px-12 py-4 bg-white text-slate-900 rounded-2xl font-bold text-xl hover:scale-105 transition-transform"
        >
          Start →
        </button>
      </div>
    )
  }

  if (phase === 'watch' || phase === 'input') {
    return (
      <div className="flex flex-col min-h-full p-6 gap-4">
        <div className="flex justify-between items-center text-sm">
          <div className="text-white/80">{currentPlayer.name}</div>
          <div className="text-white/80">
            Length: <span className="font-bold">{currentLength}</span>
          </div>
        </div>
        <div className="text-center text-xl font-bold">
          {phase === 'watch' ? 'Watch carefully...' : 'Your turn!'}
        </div>
        <div className="grid grid-cols-2 gap-4 flex-1 max-w-2xl mx-auto w-full">
          {PADS.map((pad, i) => {
            const lit = flashIdx === i
            return (
              <button
                key={i}
                disabled={phase !== 'input'}
                onClick={() => tap(i)}
                className="rounded-3xl text-2xl font-black transition-all duration-150 shadow-lg disabled:cursor-not-allowed"
                style={{
                  background: lit ? pad.hi : pad.color,
                  boxShadow: lit
                    ? `0 0 40px ${pad.hi}, 0 0 80px ${pad.hi}`
                    : undefined,
                  transform: lit ? 'scale(1.04)' : 'scale(1)',
                  minHeight: 160,
                  color: '#0a0a1a',
                }}
              >
                {pad.label}
              </button>
            )
          })}
        </div>
        {phase === 'input' && (
          <div className="text-center text-white/60 text-sm">
            {inputIdx} / {sequence.length}
          </div>
        )}
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 gap-4">
        <div
          className={`text-7xl font-black game-pop-in ${
            success ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {success ? '✓ Nice!' : '✗ Broken'}
        </div>
        <div className="text-xl text-white/80">
          Best sequence: <span className="font-bold">{scores.current[currentPlayer.id]}</span>
        </div>
        <button
          onClick={next}
          className="mt-6 px-12 py-4 bg-white text-slate-900 rounded-2xl font-bold text-xl hover:scale-105 transition-transform"
        >
          Next →
        </button>
      </div>
    )
  }

  return null
}
