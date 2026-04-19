'use client'

import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import { useGameStore } from '@/game/engine/store'
import { getBoard } from '@/game/boards/registry'
import { spaceById } from '@/game/boards/boardLogic'
import { PlayerToken } from './PlayerToken'
import { Dice3D } from './Dice3D'
import { CameraRig } from './CameraRig'
import { GameEffects } from './Effects'

interface Props {
  onDiceSettled?: () => void
  onTokenArrived?: () => void
}

export function GameCanvas({ onDiceSettled, onTokenArrived }: Props) {
  const state = useGameStore((s) => s.state)
  const board = useMemo(
    () => (state.boardId ? getBoard(state.boardId) : null),
    [state.boardId]
  )

  if (!board || state.players.length === 0) return null

  const currentPlayer = state.players[state.currentPlayerIndex]
  const targetSpace = spaceById(board, currentPlayer.spaceId)
  const BoardScene = board.Scene

  const showDice =
    state.phase === 'dice_rolling' && state.lastDiceRoll != null

  return (
    <Canvas
      shadows
      camera={{ position: [0, 11, 14], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#9ad5ff']} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <hemisphereLight args={['#cfefff', '#2d7a3d', 0.4]} />

      <Suspense fallback={null}>
        <Environment preset="park" />
      </Suspense>

      <BoardScene />

      {/* Players */}
      {state.players.map((p, i) => (
        <PlayerToken
          key={p.id}
          player={p}
          boardId={state.boardId}
          index={i}
          isCurrent={i === state.currentPlayerIndex}
          onArriveAtSpace={
            i === state.currentPlayerIndex ? onTokenArrived : undefined
          }
        />
      ))}

      {/* Dice */}
      <Dice3D
        show={showDice}
        value={state.lastDiceRoll}
        anchor={[targetSpace.position[0], 0.5, targetSpace.position[2]]}
        onSettled={onDiceSettled}
      />

      <ContactShadows
        position={[0, -0.29, 0]}
        opacity={0.45}
        scale={40}
        blur={2.2}
        far={10}
      />

      <CameraRig
        targetPosition={[targetSpace.position[0], 0, targetSpace.position[2]]}
        shakeIntensity={state.phase === 'dice_rolling' ? 0.15 : 0}
      />

      <GameEffects />
    </Canvas>
  )
}
