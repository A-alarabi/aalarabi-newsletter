import { register } from './registry'
import { triviaGame } from './trivia'
import { memoryGame } from './memory'

register(triviaGame)
register(memoryGame)

export { triviaGame, memoryGame }
export { register, getMiniGame, listMiniGames } from './registry'
export type { MiniGame, MiniGameProps, MiniGameMode } from './types'
