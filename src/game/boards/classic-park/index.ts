import type { Board } from '../types'
import { CLASSIC_PARK_SPACES, CLASSIC_PARK_START } from './definition'
import { ClassicParkScene } from './Scene'

export const classicParkBoard: Board = {
  id: 'classic-park',
  displayName: 'Sunny Park',
  description: 'A cheerful loop through rolling hills with trees and a sparkling star at the center.',
  thumbnail: '/game-thumbs/classic-park.svg',
  recommendedTurnCount: 10,
  startSpaceId: CLASSIC_PARK_START,
  spaces: CLASSIC_PARK_SPACES,
  theme: {
    palette: { sky: '#9ad5ff', ground: '#7fc96f', accent: '#ffd700' },
  },
  Scene: ClassicParkScene,
}
