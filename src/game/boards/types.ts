import type { ComponentType } from 'react'
import type { BoardId, Space, SpaceId } from '@/game/engine/types'

export interface BoardTheme {
  palette: {
    sky: string
    ground: string
    accent: string
  }
  musicUrl?: string
  ambientUrl?: string
}

export interface BoardSceneProps {
  // Board scenes render tiles + decorations. Players and dice are rendered
  // by shared scene/ components on top.
}

export interface Board {
  id: BoardId
  displayName: string
  description: string
  thumbnail: string
  recommendedTurnCount: number
  startSpaceId: SpaceId
  spaces: Space[]
  theme: BoardTheme
  Scene: ComponentType<BoardSceneProps>
}
