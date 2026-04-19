import type { MiniGame } from '../types'
import { MemoryView, type MemoryConfig } from './MemoryView'

export const memoryGame: MiniGame<MemoryConfig> = {
  id: 'memory',
  displayName: 'Echo Pattern',
  description: 'Watch the colors, repeat them back. Get further, earn more.',
  minPlayers: 1,
  maxPlayers: 4,
  mode: 'ffa',
  View: MemoryView,
  buildConfig: () => ({
    startLength: 3,
    maxLength: 8,
    flashMs: 500,
    gapMs: 220,
  }),
  scoresToResult: (scoresByPlayer, players) => {
    // coins = length achieved * 2
    const rewardsByPlayer: Record<string, { coins: number }> = {}
    players.forEach((p) => {
      rewardsByPlayer[p.id] = { coins: (scoresByPlayer[p.id] ?? 0) * 2 }
    })
    return { rewardsByPlayer }
  },
}
