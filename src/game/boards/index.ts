import { register } from './registry'
import { classicParkBoard } from './classic-park'

register(classicParkBoard)

export { classicParkBoard }
export { register, getBoard, listBoards } from './registry'
export type { Board, BoardTheme, BoardSceneProps } from './types'
