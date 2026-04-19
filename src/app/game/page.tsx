import Link from 'next/link'

export default function GameLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-slate-900 to-purple-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animation: `twinkle ${2 + (i % 3)}s ease-in-out ${(i * 0.11) % 2}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center game-pop-in">
        <div className="text-white/60 uppercase tracking-[0.4em] text-sm mb-4">
          A party game
        </div>
        <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-500 drop-shadow-2xl mb-4">
          PARTY BLITZ
        </div>
        <p className="text-xl text-white/80 mb-12 max-w-xl mx-auto">
          Roll the dice. Race around the board. Battle your friends in
          lightning mini-games. Whoever collects the most stars wins.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/game/setup"
            className="px-16 py-6 bg-gradient-to-b from-amber-300 to-amber-500 text-slate-900 rounded-3xl font-black text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-transform game-pulse"
          >
            ▶ START
          </Link>
          <div className="text-white/50 text-sm mt-2">
            2–4 players • pass and play • ~10 minutes
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </div>
  )
}
