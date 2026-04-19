import type { Action } from './actions'
import { createRNG } from './rng'
import type { GameState, Player, Space } from './types'
import { getBoard } from '@/game/boards/registry'
import { computePath, spaceById } from '@/game/boards/boardLogic'

const STAR_COST = 20

export function initialState(): GameState {
  return {
    schemaVersion: 1,
    seed: 0,
    boardId: '',
    players: [],
    currentPlayerIndex: 0,
    turnNumber: 0,
    totalTurns: 0,
    phase: 'intro',
    lastDiceRoll: null,
    pendingMovement: null,
    activeMiniGame: null,
    winnerId: null,
  }
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INIT_GAME': {
      const { seed, boardId, totalTurns, players, startSpaceId } = action.payload
      return {
        schemaVersion: 1,
        seed,
        boardId,
        players: players.map((p) => ({
          ...p,
          spaceId: startSpaceId,
          coins: 10,
          stars: 0,
        })),
        currentPlayerIndex: 0,
        turnNumber: 1,
        totalTurns,
        phase: 'intro',
        lastDiceRoll: null,
        pendingMovement: null,
        activeMiniGame: null,
        winnerId: null,
      }
    }

    case 'START_TURN':
      return { ...state, phase: 'awaiting_roll' }

    case 'ROLL_DICE': {
      // Deterministic: derive RNG from seed + turnNumber + currentPlayerIndex
      const rng = createRNG(state.seed ^ (state.turnNumber * 73856093) ^ (state.currentPlayerIndex * 19349663))
      const roll = rng.int(6) + 1
      return { ...state, phase: 'dice_rolling', lastDiceRoll: roll }
    }

    case 'DICE_ANIMATION_DONE': {
      if (state.lastDiceRoll == null) return state
      const board = getBoard(state.boardId)
      const current = currentPlayer(state)
      const path = computePath(board, current.spaceId, state.lastDiceRoll, state.seed + state.turnNumber)
      return { ...state, phase: 'moving', pendingMovement: path }
    }

    case 'MOVE_STEP_DONE': {
      if (!state.pendingMovement || state.pendingMovement.length === 0) return state
      const [nextSpaceId, ...rest] = state.pendingMovement
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, spaceId: nextSpaceId } : p
      )
      if (rest.length === 0) {
        return { ...state, players, pendingMovement: null, phase: 'space_resolve' }
      }
      return { ...state, players, pendingMovement: rest }
    }

    case 'RESOLVE_SPACE': {
      const board = getBoard(state.boardId)
      const current = currentPlayer(state)
      const space = spaceById(board, current.spaceId)
      return applySpaceEffect(state, space)
    }

    case 'START_MINIGAME': {
      const rng = createRNG(state.seed ^ (state.turnNumber * 0xabcdef))
      const seed = rng.int(0x7fffffff)
      return {
        ...state,
        phase: 'minigame_intro',
        activeMiniGame: {
          id: action.payload.minigameId,
          seed,
          configJSON: '',
          participantIds: state.players.map((p) => p.id),
        },
      }
    }

    case 'MINIGAME_INTRO_DONE':
      return { ...state, phase: 'minigame_active' }

    case 'SUBMIT_MINIGAME_RESULT': {
      const rewards = action.payload.result.rewardsByPlayer
      const players = state.players.map((p) => {
        const r = rewards[p.id]
        if (!r) return p
        return {
          ...p,
          coins: Math.max(0, p.coins + r.coins),
          stars: p.stars + (r.stars ?? 0),
        }
      })
      return {
        ...state,
        players,
        activeMiniGame: null,
        phase: 'minigame_payout',
      }
    }

    case 'BUY_STAR': {
      const current = currentPlayer(state)
      if (current.coins < STAR_COST) return state
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, coins: p.coins - STAR_COST, stars: p.stars + 1 }
          : p
      )
      return { ...state, players }
    }

    case 'END_TURN': {
      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length
      const nextTurnNumber =
        nextIndex === 0 ? state.turnNumber + 1 : state.turnNumber

      if (nextIndex === 0 && nextTurnNumber > state.totalTurns) {
        const winner = determineWinner(state.players)
        return {
          ...state,
          phase: 'game_over',
          winnerId: winner.id,
        }
      }

      return {
        ...state,
        currentPlayerIndex: nextIndex,
        turnNumber: nextTurnNumber,
        phase: 'intro',
        lastDiceRoll: null,
        pendingMovement: null,
      }
    }

    default:
      return state
  }
}

function applySpaceEffect(state: GameState, space: Space): GameState {
  const players = [...state.players]
  const current = { ...players[state.currentPlayerIndex] }

  switch (space.type) {
    case 'blue':
      current.coins += 3
      break
    case 'red':
      current.coins = Math.max(0, current.coins - 3)
      break
    case 'star':
      if (current.coins >= STAR_COST) {
        current.coins -= STAR_COST
        current.stars += 1
      }
      break
    case 'minigame': {
      // Landing on minigame space triggers — handled in store side-effect
      players[state.currentPlayerIndex] = current
      return { ...state, players, phase: 'space_resolve' }
    }
    case 'chance': {
      const rng = createRNG(state.seed ^ state.turnNumber ^ state.currentPlayerIndex ^ 0xdeadbeef)
      const delta = rng.int(11) - 5 // -5..+5
      current.coins = Math.max(0, current.coins + delta)
      break
    }
    case 'start':
    default:
      break
  }

  players[state.currentPlayerIndex] = current
  return { ...state, players, phase: 'space_resolve' }
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex]
}

function determineWinner(players: Player[]): Player {
  const sorted = [...players].sort((a, b) => {
    if (b.stars !== a.stars) return b.stars - a.stars
    return b.coins - a.coins
  })
  return sorted[0]
}

export function replayFromLog(init: GameState, actions: readonly Action[]): GameState {
  let s = init
  for (const a of actions) s = reducer(s, a)
  return s
}
