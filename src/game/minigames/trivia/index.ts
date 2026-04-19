import type { MiniGame } from '../types'
import { TriviaView, type TriviaConfig } from './TriviaView'
import { TRIVIA_BANK } from './questions'

const QUESTIONS_PER_ROUND = 3

export const triviaGame: MiniGame<TriviaConfig> = {
  id: 'trivia',
  displayName: 'Trivia Time',
  description: 'Fastest correct answer earns the most coins.',
  minPlayers: 1,
  maxPlayers: 4,
  mode: 'ffa',
  View: TriviaView,
  buildConfig: (rng) => {
    const questions = rng
      .shuffle(TRIVIA_BANK)
      .slice(0, QUESTIONS_PER_ROUND)
    return { questions, secondsPerQuestion: 15 }
  },
  scoresToResult: (scoresByPlayer, players) => {
    // Convert raw points to coin rewards: top scorer +10, 2nd +5, 3rd +2, last 0
    const ranked = [...players].sort(
      (a, b) => (scoresByPlayer[b.id] ?? 0) - (scoresByPlayer[a.id] ?? 0)
    )
    const payouts = [10, 5, 2, 0]
    const rewardsByPlayer: Record<string, { coins: number }> = {}
    ranked.forEach((p, i) => {
      const scored = (scoresByPlayer[p.id] ?? 0) > 0
      rewardsByPlayer[p.id] = { coins: scored ? payouts[Math.min(i, 3)] : 0 }
    })
    return { rewardsByPlayer }
  },
}
