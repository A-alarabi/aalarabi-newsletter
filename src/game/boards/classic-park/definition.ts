import type { Space, SpaceType } from '@/game/engine/types'

const SPACE_COUNT = 20
const RADIUS = 9

const typePattern: SpaceType[] = [
  'start',
  'blue',
  'blue',
  'red',
  'minigame',
  'blue',
  'chance',
  'blue',
  'red',
  'minigame',
  'star',
  'blue',
  'blue',
  'red',
  'chance',
  'minigame',
  'blue',
  'red',
  'blue',
  'chance',
]

export const CLASSIC_PARK_START: string = 'cp-0'

export const CLASSIC_PARK_SPACES: Space[] = Array.from({ length: SPACE_COUNT }, (_, i) => {
  const angle = (i / SPACE_COUNT) * Math.PI * 2
  const x = Math.cos(angle) * RADIUS
  const z = Math.sin(angle) * RADIUS
  const next = `cp-${(i + 1) % SPACE_COUNT}`
  return {
    id: `cp-${i}`,
    type: typePattern[i] ?? 'blue',
    position: [x, 0, z],
    neighbors: [next],
  }
})
