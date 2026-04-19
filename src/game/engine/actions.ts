import type { CharacterId, MiniGameResult, PlayerId } from './types'

export type Action =
  | { type: 'INIT_GAME'; payload: InitPayload }
  | { type: 'START_TURN' }
  | { type: 'ROLL_DICE' }
  | { type: 'DICE_ANIMATION_DONE' }
  | { type: 'MOVE_STEP_DONE' }      // token finished one space-hop
  | { type: 'RESOLVE_SPACE' }
  | { type: 'START_MINIGAME'; payload: { minigameId: string } }
  | { type: 'MINIGAME_INTRO_DONE' }
  | { type: 'SUBMIT_MINIGAME_RESULT'; payload: { result: MiniGameResult } }
  | { type: 'END_TURN' }
  | { type: 'BUY_STAR' }

export interface InitPayload {
  seed: number
  boardId: string
  totalTurns: number
  players: Array<{
    id: PlayerId
    name: string
    character: CharacterId
    color: string
  }>
  startSpaceId: string
}

export const Actions = {
  init: (payload: InitPayload): Action => ({ type: 'INIT_GAME', payload }),
  startTurn: (): Action => ({ type: 'START_TURN' }),
  rollDice: (): Action => ({ type: 'ROLL_DICE' }),
  diceAnimationDone: (): Action => ({ type: 'DICE_ANIMATION_DONE' }),
  moveStepDone: (): Action => ({ type: 'MOVE_STEP_DONE' }),
  resolveSpace: (): Action => ({ type: 'RESOLVE_SPACE' }),
  startMinigame: (minigameId: string): Action => ({
    type: 'START_MINIGAME',
    payload: { minigameId },
  }),
  minigameIntroDone: (): Action => ({ type: 'MINIGAME_INTRO_DONE' }),
  submitMinigameResult: (result: MiniGameResult): Action => ({
    type: 'SUBMIT_MINIGAME_RESULT',
    payload: { result },
  }),
  endTurn: (): Action => ({ type: 'END_TURN' }),
  buyStar: (): Action => ({ type: 'BUY_STAR' }),
}
