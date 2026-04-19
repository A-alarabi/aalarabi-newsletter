'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Action } from './actions'
import { ActionLog } from './actionLog'
import { initialState, reducer } from './reducer'
import type { GameState } from './types'

export interface Transport {
  dispatch(action: Action): void
}

export interface GameStore {
  state: GameState
  log: ActionLog
  dispatch: (action: Action) => void
  reset: () => void
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => {
    const log = new ActionLog()
    return {
      state: initialState(),
      log,
      dispatch: (action: Action) => {
        const { state } = get()
        const next = reducer(state, action)
        log.append(action)
        set({ state: next })
      },
      reset: () => {
        log.clear()
        set({ state: initialState() })
      },
    }
  })
)

// Phase 2 online seam: swap local dispatch for a WebSocket transport that
// sends actions to the server and applies server-broadcast actions via the
// same reducer. Engine code doesn't change.
export const LocalTransport: Transport = {
  dispatch(action) {
    useGameStore.getState().dispatch(action)
  },
}
