'use client'

import Link from 'next/link'
import { useGameStore } from '@/game/engine/store'
import { selectPlayersByStars } from '@/game/engine/selectors'

export function WinnerScreen() {
  const state = useGameStore((s) => s.state)
  const reset = useGameStore((s) => s.reset)
  const ranked = selectPlayersByStars(state)

  if (state.players.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-3xl font-bold mb-4">No game to show</div>
          <Link
            href="/game"
            className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold"
          >
            Back to menu
          </Link>
        </div>
      </div>
    )
  }

  const winner = ranked[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 flex items-center justify-center p-6 overflow-hidden relative">
      <Confetti />
      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center mb-8 game-pop-in">
          <div className="text-white/60 uppercase tracking-[0.4em] text-sm">
            Winner
          </div>
          <div className="text-7xl md:text-9xl font-black text-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] my-4">
            {winner.name}
          </div>
          <div className="text-2xl text-white/90">
            🏆 {winner.stars} stars • {winner.coins} coins
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-3xl p-6 game-slide-up">
          <div className="text-white/80 font-bold mb-4">Final standings</div>
          <div className="space-y-2">
            {ranked.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-black text-white/60 w-8">
                    {i + 1}
                  </div>
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white/60"
                    style={{ background: p.color }}
                  />
                  <div className="text-white font-bold text-lg">{p.name}</div>
                </div>
                <div className="flex gap-4">
                  <div className="text-yellow-300 font-bold">★ {p.stars}</div>
                  <div className="text-amber-300 font-bold">¢ {p.coins}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center mt-8">
          <Link
            href="/game/setup"
            onClick={() => reset()}
            className="px-8 py-4 bg-yellow-400 text-slate-900 rounded-2xl font-black text-lg hover:scale-105 transition-transform"
          >
            Play again
          </Link>
          <Link
            href="/game"
            onClick={() => reset()}
            className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-colors"
          >
            Main menu
          </Link>
        </div>
      </div>
    </div>
  )
}

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => i)
  const colors = ['#ff4d4d', '#ffb347', '#ffd700', '#4ade80', '#60a5fa', '#c084fc']
  return (
    <div className="absolute inset-0 pointer-events-none">
      {pieces.map((i) => {
        const left = (i * 37) % 100
        const delay = (i * 0.13) % 4
        const color = colors[i % colors.length]
        const size = 6 + (i % 3) * 3
        return (
          <div
            key={i}
            className="absolute top-[-20px] rounded-sm"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.4,
              background: color,
              animation: `confetti-fall ${3 + (i % 4)}s linear ${delay}s infinite`,
              transform: `rotate(${(i * 17) % 360}deg)`,
            }}
          />
        )
      })}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}
