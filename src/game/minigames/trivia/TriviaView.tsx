'use client'

import { useEffect, useRef, useState } from 'react'
import type { MiniGameProps } from '../types'
import type { TriviaQuestion } from './questions'
import type { PlayerId } from '@/game/engine/types'

export interface TriviaConfig {
  questions: TriviaQuestion[]
  secondsPerQuestion: number
}

type Phase = 'pass_device' | 'question' | 'result' | 'done'

const KAHOOT_COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
const KAHOOT_SYMBOLS = ['▲', '◆', '●', '■']

export function TriviaView({
  players,
  config,
  onComplete,
}: MiniGameProps<TriviaConfig>) {
  const [playerIdx, setPlayerIdx] = useState(0)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('pass_device')
  const [timeLeft, setTimeLeft] = useState(config.secondsPerQuestion)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [lastEarned, setLastEarned] = useState(0)
  const scores = useRef<Record<PlayerId, number>>(
    Object.fromEntries(players.map((p) => [p.id, 0]))
  )
  const questionStartMs = useRef<number>(0)

  const currentPlayer = players[playerIdx]
  const question = config.questions[questionIdx]

  useEffect(() => {
    if (phase !== 'question') return
    questionStartMs.current = performance.now()
    setTimeLeft(config.secondsPerQuestion)
    const iv = setInterval(() => {
      const elapsed = (performance.now() - questionStartMs.current) / 1000
      const remaining = Math.max(0, config.secondsPerQuestion - elapsed)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(iv)
        answer(-1)
      }
    }, 80)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionIdx])

  function answer(choice: number) {
    const elapsed = (performance.now() - questionStartMs.current) / 1000
    const correct = choice === question.correct
    let earned = 0
    if (correct) {
      const timeBonus = Math.max(
        0,
        (config.secondsPerQuestion - elapsed) / config.secondsPerQuestion
      )
      earned = Math.round(500 + 500 * timeBonus)
      scores.current[currentPlayer.id] += earned
    }
    setLastCorrect(correct)
    setLastEarned(earned)
    setPhase('result')
  }

  function next() {
    const nextPlayerIdx = playerIdx + 1
    if (nextPlayerIdx < players.length) {
      setPlayerIdx(nextPlayerIdx)
      setPhase('pass_device')
      return
    }
    // Next question
    const nextQ = questionIdx + 1
    if (nextQ < config.questions.length) {
      setQuestionIdx(nextQ)
      setPlayerIdx(0)
      setPhase('pass_device')
      return
    }
    setPhase('done')
    onComplete({ ...scores.current })
  }

  if (phase === 'pass_device') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 gap-6">
        <div className="text-sm uppercase tracking-widest text-white/60">
          Question {questionIdx + 1} of {config.questions.length}
        </div>
        <div className="text-6xl game-pop-in">📱</div>
        <div className="text-3xl font-bold">Pass device to</div>
        <div
          className="px-8 py-4 rounded-2xl text-4xl font-black game-pulse shadow-2xl"
          style={{ background: currentPlayer.color, color: '#0a0a1a' }}
        >
          {currentPlayer.name}
        </div>
        <button
          onClick={() => setPhase('question')}
          className="mt-4 px-12 py-4 bg-white text-slate-900 rounded-2xl font-bold text-xl hover:scale-105 transition-transform"
        >
          I&apos;m ready →
        </button>
      </div>
    )
  }

  if (phase === 'question') {
    const pct = (timeLeft / config.secondsPerQuestion) * 100
    return (
      <div className="flex flex-col min-h-full p-6 gap-4">
        <div className="flex justify-between items-center text-sm">
          <div className="text-white/70">
            {currentPlayer.name} • {question.category}
          </div>
          <div className="text-white/70">
            Q {questionIdx + 1}/{config.questions.length}
          </div>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-yellow-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-center my-6 text-2xl md:text-4xl font-bold px-4 game-slide-up">
          {question.q}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
          {question.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => answer(i)}
              className="p-6 rounded-2xl text-xl font-bold text-white shadow-lg hover:scale-[1.02] transition-transform active:scale-95 flex items-center gap-4"
              style={{ background: KAHOOT_COLORS[i] }}
            >
              <span className="text-3xl">{KAHOOT_SYMBOLS[i]}</span>
              <span className="text-left flex-1">{choice}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 gap-4">
        <div
          className={`text-7xl font-black game-pop-in ${
            lastCorrect ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {lastCorrect ? '✓ Correct!' : '✗ Wrong'}
        </div>
        {!lastCorrect && (
          <div className="text-xl text-white/80">
            Answer: <span className="font-bold">{question.choices[question.correct]}</span>
          </div>
        )}
        {lastCorrect && (
          <div className="text-2xl font-bold text-yellow-300 game-slide-up">
            +{lastEarned} points
          </div>
        )}
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
