import type { GameState, TurnPhase } from './types'

const VALID_NEXT: Record<TurnPhase, TurnPhase[]> = {
  intro: ['awaiting_roll'],
  awaiting_roll: ['dice_rolling'],
  dice_rolling: ['moving'],
  moving: ['space_resolve'],
  space_resolve: ['minigame_intro', 'turn_end'],
  minigame_intro: ['minigame_active'],
  minigame_active: ['minigame_payout'],
  minigame_payout: ['turn_end'],
  turn_end: ['intro', 'game_over'],
  game_over: [],
}

export function canTransition(from: TurnPhase, to: TurnPhase): boolean {
  return VALID_NEXT[from]?.includes(to) ?? false
}

export function isRollReady(state: GameState): boolean {
  return state.phase === 'awaiting_roll'
}

export function isEndTurnReady(state: GameState): boolean {
  return state.phase === 'space_resolve' || state.phase === 'minigame_payout'
}
