'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { CharacterId, Player, SpaceId } from '@/game/engine/types'
import { getBoard } from '@/game/boards/registry'
import { spaceById } from '@/game/boards/boardLogic'

interface Props {
  player: Player
  boardId: string
  index: number       // stacking offset when multiple players share a space
  isCurrent: boolean
  onArriveAtSpace?: (spaceId: SpaceId) => void
}

const CHARACTER_COLORS: Record<CharacterId, { body: string; accent: string }> = {
  fox:    { body: '#ff8c42', accent: '#ffffff' },
  bear:   { body: '#8b5a2b', accent: '#f5deb3' },
  panda:  { body: '#ffffff', accent: '#1a1a1a' },
  rabbit: { body: '#e8cfd0', accent: '#ffffff' },
}

const HOP_DURATION = 0.32

export function PlayerToken({ player, boardId, index, isCurrent, onArriveAtSpace }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3())
  const fromPos = useRef<THREE.Vector3>(new THREE.Vector3())
  const hopProgress = useRef(1)
  const currentSpaceId = useRef(player.spaceId)
  const idleBob = useRef(Math.random() * Math.PI * 2)

  const board = getBoard(boardId)
  const colors = CHARACTER_COLORS[player.character]

  // Compute target world position from spaceId
  useEffect(() => {
    if (!groupRef.current) return
    const space = spaceById(board, player.spaceId)
    const offsetAngle = (index / 4) * Math.PI * 2
    const offsetR = 0.25
    const tx = space.position[0] + Math.cos(offsetAngle) * offsetR
    const tz = space.position[2] + Math.sin(offsetAngle) * offsetR
    const ty = 0

    if (currentSpaceId.current !== player.spaceId) {
      fromPos.current.copy(groupRef.current.position)
      targetPos.current.set(tx, ty, tz)
      hopProgress.current = 0
      currentSpaceId.current = player.spaceId
    } else if (hopProgress.current >= 1) {
      groupRef.current.position.set(tx, ty, tz)
      targetPos.current.set(tx, ty, tz)
    }
  }, [player.spaceId, board, index])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    idleBob.current += delta * 2
    const bobY = Math.sin(idleBob.current) * 0.04

    if (hopProgress.current < 1) {
      hopProgress.current = Math.min(1, hopProgress.current + delta / HOP_DURATION)
      const t = hopProgress.current
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      const arc = Math.sin(t * Math.PI) * 1.1
      groupRef.current.position.x =
        fromPos.current.x + (targetPos.current.x - fromPos.current.x) * ease
      groupRef.current.position.z =
        fromPos.current.z + (targetPos.current.z - fromPos.current.z) * ease
      groupRef.current.position.y = arc
      // Face direction of movement
      const dx = targetPos.current.x - fromPos.current.x
      const dz = targetPos.current.z - fromPos.current.z
      if (Math.abs(dx) + Math.abs(dz) > 0.01) {
        groupRef.current.rotation.y = Math.atan2(dx, dz)
      }
      if (hopProgress.current >= 1 && onArriveAtSpace) {
        onArriveAtSpace(player.spaceId)
      }
    } else {
      groupRef.current.position.y = bobY
    }

    // Scale up slightly when it's your turn
    const targetScale = isCurrent ? 1.15 : 1
    const s = groupRef.current.scale.x
    const ns = s + (targetScale - s) * Math.min(1, delta * 6)
    groupRef.current.scale.setScalar(ns)
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Ring highlight for active player */}
      {isCurrent && (
        <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.45, 0.6, 24]} />
          <meshBasicMaterial color={player.color} transparent opacity={0.7} />
        </mesh>
      )}
      {/* Body - rounded */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={colors.body} roughness={0.6} />
      </mesh>
      {/* Belly accent */}
      <mesh position={[0, 0.35, 0.2]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color={colors.accent} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.88, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={colors.body} roughness={0.6} />
      </mesh>
      {/* Ears - two small cones */}
      <mesh position={[-0.18, 1.15, 0]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color={colors.body} roughness={0.6} />
      </mesh>
      <mesh position={[0.18, 1.15, 0]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color={colors.body} roughness={0.6} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.1, 0.92, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#0a0a1a" />
      </mesh>
      <mesh position={[0.1, 0.92, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#0a0a1a" />
      </mesh>
      {/* Player color badge */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.37, 0.4, 0.12, 16]} />
        <meshStandardMaterial
          color={player.color}
          emissive={player.color}
          emissiveIntensity={0.25}
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>
    </group>
  )
}
