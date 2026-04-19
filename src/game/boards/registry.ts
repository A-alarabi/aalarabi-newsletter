import type { Board } from './types'

const registry = new Map<string, Board>()

export function register(board: Board): void {
  registry.set(board.id, board)
}

export function getBoard(id: string): Board {
  const b = registry.get(id)
  if (!b) throw new Error(`Board not found: ${id}`)
  return b
}

export function listBoards(): Board[] {
  return [...registry.values()]
}
