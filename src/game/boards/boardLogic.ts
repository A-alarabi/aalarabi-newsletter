import type { Space, SpaceId } from '@/game/engine/types'
import { createRNG } from '@/game/engine/rng'
import type { Board } from './types'

export function spaceById(board: Board, id: SpaceId): Space {
  const s = board.spaces.find((sp) => sp.id === id)
  if (!s) throw new Error(`Space not found on board ${board.id}: ${id}`)
  return s
}

/**
 * Computes the path of N space hops from `from`. If a space has multiple
 * neighbors, picks deterministically from `seed` to keep branches
 * replayable.
 */
export function computePath(
  board: Board,
  from: SpaceId,
  steps: number,
  seed: number
): SpaceId[] {
  const rng = createRNG(seed)
  const path: SpaceId[] = []
  let current = from
  for (let i = 0; i < steps; i++) {
    const space = spaceById(board, current)
    if (space.neighbors.length === 0) break
    const next =
      space.neighbors.length === 1
        ? space.neighbors[0]
        : rng.pick(space.neighbors)
    path.push(next)
    current = next
  }
  return path
}
