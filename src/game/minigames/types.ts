import type { ComponentType } from 'react'
import type { MiniGameResult, Player, PlayerId } from '@/game/engine/types'
import type { RNG } from '@/game/engine/rng'

export type MiniGameMode = 'ffa' | 'versus' | 'solo'

export interface MiniGameProps<TConfig = unknown> {
  players: Player[]
  localPlayerId: PlayerId
  config: TConfig
  onComplete: (scoresByPlayer: Record<PlayerId, number>) => void
}

export interface MiniGame<TConfig = unknown> {
  id: string
  displayName: string
  description: string
  minPlayers: number
  maxPlayers: number
  mode: MiniGameMode
  View: ComponentType<MiniGameProps<TConfig>>
  buildConfig(rng: RNG, players: Player[]): TConfig
  scoresToResult(scoresByPlayer: Record<PlayerId, number>, players: Player[]): MiniGameResult
}
