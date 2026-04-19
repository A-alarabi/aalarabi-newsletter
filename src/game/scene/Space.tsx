'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Space, SpaceType } from '@/game/engine/types'

const SPACE_COLORS: Record<SpaceType, string> = {
  start: '#ffd700',
  blue: '#3b82f6',
  red: '#ef4444',
  minigame: '#a855f7',
  chance: '#10b981',
  star: '#ffd700',
}

const SPACE_EMISSIVE: Record<SpaceType, number> = {
  start: 0.3,
  blue: 0.15,
  red: 0.15,
  minigame: 0.4,
  chance: 0.25,
  star: 0.6,
}

const SPACE_LABELS: Record<SpaceType, string> = {
  start: 'START',
  blue: '+',
  red: '-',
  minigame: '?',
  chance: '!',
  star: '★',
}

export function SpaceTile({ space }: { space: Space }) {
  const color = SPACE_COLORS[space.type]
  const emissive = SPACE_EMISSIVE[space.type]
  const meshRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    if (space.type === 'star' || space.type === 'minigame') {
      pulseRef.current += delta * 2
      const s = 1 + Math.sin(pulseRef.current) * 0.05
      meshRef.current.scale.set(s, 1, s)
    }
  })

  return (
    <group position={space.position}>
      {/* Tile base */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 0.9, 0.4, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissive}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      {/* Star/special halo for important tiles */}
      {(space.type === 'star' || space.type === 'minigame') && (
        <mesh position={[0, 0.3, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.95, 1.15, 24]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {/* Label floating slightly above */}
      {space.type !== 'start' && (
        <mesh position={[0, 0.22, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.4, 16]} />
          <meshBasicMaterial color="white" />
        </mesh>
      )}
      {/* Label text via texture-less symbol: approximated with small shapes */}
      <SymbolMesh symbol={SPACE_LABELS[space.type]} />
    </group>
  )
}

function SymbolMesh({ symbol }: { symbol: string }) {
  // Simple 3D symbol approximation — a tiny plaque color varies
  // In production you'd use drei's <Text> but keeping deps light.
  const color = '#0a0a1a'
  switch (symbol) {
    case '+':
      return (
        <group position={[0, 0.24, 0]} rotation-x={-Math.PI / 2}>
          <mesh>
            <boxGeometry args={[0.35, 0.08, 0.01]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.08, 0.35, 0.01]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      )
    case '-':
      return (
        <mesh position={[0, 0.24, 0]} rotation-x={-Math.PI / 2}>
          <boxGeometry args={[0.35, 0.08, 0.01]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )
    case '?':
      return (
        <mesh position={[0, 0.24, 0]} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[0.15, 0.04, 8, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )
    case '!':
      return (
        <group position={[0, 0.24, 0]} rotation-x={-Math.PI / 2}>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.08, 0.22, 0.01]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <circleGeometry args={[0.05, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      )
    case '★':
      return (
        <mesh position={[0, 0.24, 0.01]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.2, 5]} />
          <meshBasicMaterial color="#ffb800" />
        </mesh>
      )
    case 'START':
      return (
        <mesh position={[0, 0.24, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.18, 0.28, 24]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )
    default:
      return null
  }
}
