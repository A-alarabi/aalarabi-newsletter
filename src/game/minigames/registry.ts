import type { MiniGame } from './types'

const registry = new Map<string, MiniGame<any>>()

export function register<T>(game: MiniGame<T>): void {
  registry.set(game.id, game as MiniGame<any>)
}

export function getMiniGame(id: string): MiniGame<any> {
  const g = registry.get(id)
  if (!g) throw new Error(`Mini-game not found: ${id}`)
  return g
}

export function listMiniGames(): MiniGame<any>[] {
  return [...registry.values()]
}
