export type PlayerId = string
export type SpaceId = string
export type BoardId = string
export type MiniGameId = string

export type CharacterId = 'fox' | 'bear' | 'panda' | 'rabbit'

export interface Player {
  id: PlayerId
  name: string
  character: CharacterId
  color: string
  spaceId: SpaceId
  coins: number
  stars: number
}

export type SpaceType =
  | 'start'
  | 'blue'      // +3 coins
  | 'red'       // -3 coins
  | 'minigame'  // triggers mini-game vote
  | 'chance'    // random event
  | 'star'      // pay 20 coins for a star

export interface Space {
  id: SpaceId
  type: SpaceType
  position: [number, number, number]
  neighbors: SpaceId[]
}

export type TurnPhase =
  | 'intro'          // "Player X's turn" banner
  | 'awaiting_roll'
  | 'dice_rolling'   // animation in-flight
  | 'moving'         // token animating along path
  | 'space_resolve'  // apply space effect
  | 'minigame_intro' // "TRIVIA TIME!" card
  | 'minigame_active'
  | 'minigame_payout'
  | 'turn_end'
  | 'game_over'

export interface MiniGameSession {
  id: MiniGameId
  seed: number
  configJSON: string         // config serialized
  participantIds: PlayerId[]
}

export interface GameState {
  schemaVersion: 1
  seed: number
  boardId: BoardId
  players: Player[]
  currentPlayerIndex: number
  turnNumber: number
  totalTurns: number
  phase: TurnPhase
  lastDiceRoll: number | null
  pendingMovement: SpaceId[] | null  // remaining path to walk
  activeMiniGame: MiniGameSession | null
  winnerId: PlayerId | null
}

export interface MiniGameReward {
  coins: number
  stars?: number
}

export interface MiniGameResult {
  rewardsByPlayer: Record<PlayerId, MiniGameReward>
}
