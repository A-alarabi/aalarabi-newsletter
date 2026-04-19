import type { GameState, Player } from './types'

export const selectCurrentPlayer = (s: GameState): Player =>
  s.players[s.currentPlayerIndex]

export const selectIsCurrent = (s: GameState, playerId: string): boolean =>
  s.players[s.currentPlayerIndex]?.id === playerId

export const selectPlayersByStars = (s: GameState): Player[] =>
  [...s.players].sort((a, b) => {
    if (b.stars !== a.stars) return b.stars - a.stars
    return b.coins - a.coins
  })

export const selectTurnsRemaining = (s: GameState): number =>
  Math.max(0, s.totalTurns - s.turnNumber + 1)
