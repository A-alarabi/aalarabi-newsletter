'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/game/engine/store'
import { Actions } from '@/game/engine/actions'
import { createRNG } from '@/game/engine/rng'
import { getBoard } from '@/game/boards/registry'
import { spaceById } from '@/game/boards/boardLogic'
import { listMiniGames } from '@/game/minigames/registry'
import { sounds } from '@/game/audio/SoundManager'
import { GameCanvas } from '@/game/scene/GameCanvas'
import { HUD } from './HUD'
import { RollButton } from './RollButton'
import { PassDevicePrompt } from './PassDevicePrompt'
import { MiniGameHost } from './MiniGameHost'
import { SpaceResolveToast } from './SpaceResolveToast'

export function GameRoot() {
  const router = useRouter()
  const phase = useGameStore((s) => s.state.phase)
  const turnNumber = useGameStore((s) => s.state.turnNumber)
  const currentPlayerIndex = useGameStore((s) => s.state.currentPlayerIndex)
  const pendingLen = useGameStore((s) => s.state.pendingMovement?.length ?? 0)
  const hasGame = useGameStore((s) => s.state.players.length > 0 && s.state.boardId !== '')

  useEffect(() => {
    if (!hasGame) router.replace('/game/setup')
  }, [hasGame, router])

  const resolvedKeyRef = useRef<string | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Stable callbacks that always read latest state via getState()
  const onDiceSettled = useCallback(() => {
    const s = useGameStore.getState().state
    if (s.phase === 'dice_rolling') {
      useGameStore.getState().dispatch(Actions.diceAnimationDone())
    }
  }, [])

  const onTokenArrived = useCallback(() => {
    const s = useGameStore.getState().state
    if (
      s.phase === 'moving' &&
      s.pendingMovement &&
      s.pendingMovement.length > 0
    ) {
      sounds.play('hop', 0.4)
      useGameStore.getState().dispatch(Actions.moveStepDone())
    }
  }, [])

  // Kick off the first hop when we enter 'moving'
  useEffect(() => {
    if (phase === 'moving' && pendingLen > 0) {
      // The state already has pendingMovement; dispatching MOVE_STEP_DONE
      // advances player to first space so PlayerToken animates there.
      sounds.play('hop', 0.4)
      useGameStore.getState().dispatch(Actions.moveStepDone())
    }
    // Intentionally depend on phase only — we only want to kick off once per
    // 'moving' entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Resolve space effect on arrival
  useEffect(() => {
    if (phase !== 'space_resolve') return
    const key = `${turnNumber}-${currentPlayerIndex}`
    if (resolvedKeyRef.current === key) return
    resolvedKeyRef.current = key

    const dispatch = useGameStore.getState().dispatch
    dispatch(Actions.resolveSpace())

    const s = useGameStore.getState().state
    const board = getBoard(s.boardId)
    const current = s.players[s.currentPlayerIndex]
    const space = spaceById(board, current.spaceId)

    if (space.type === 'minigame') {
      const games = listMiniGames()
      const rng = createRNG(s.seed ^ (s.turnNumber * 0xabc123))
      const pick = games[rng.int(games.length)]
      const t = setTimeout(() => {
        dispatch(Actions.startMinigame(pick.id))
      }, 1100)
      timeoutsRef.current.push(t)
    } else {
      if (space.type === 'blue' || space.type === 'star') sounds.play('coin')
      if (space.type === 'red') sounds.play('wrong', 0.5)
      if (space.type === 'chance') sounds.play('select')
      const t = setTimeout(() => {
        dispatch(Actions.endTurn())
      }, 1400)
      timeoutsRef.current.push(t)
    }
  }, [phase, turnNumber, currentPlayerIndex])

  // Game over → navigate
  useEffect(() => {
    if (phase === 'game_over') {
      sounds.play('win')
      router.push('/game/results')
    }
  }, [phase, router])

  // Cleanup scheduled timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t))
      timeoutsRef.current = []
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-900">
      <GameCanvas onDiceSettled={onDiceSettled} onTokenArrived={onTokenArrived} />
      <HUD />
      <RollButton />
      <SpaceResolveToast />
      <PassDevicePrompt />
      <MiniGameHost />
    </div>
  )
}
