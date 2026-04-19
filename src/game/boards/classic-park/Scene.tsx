'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { CLASSIC_PARK_SPACES } from './definition'
import { SpaceTile } from '@/game/scene/Space'

export function ClassicParkScene() {
  const cloudsRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.02
  })

  return (
    <group>
      {/* Sky gradient dome */}
      <mesh scale={[80, 80, 80]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#9ad5ff" side={THREE.BackSide} />
      </mesh>

      {/* Ground disc */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.6, 0]} receiveShadow>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color="#7fc96f" roughness={0.9} />
      </mesh>

      {/* Inner grass mound */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6.5, 0.6, 40]} />
        <meshStandardMaterial color="#8fd680" roughness={0.95} />
      </mesh>

      {/* Board tiles */}
      {CLASSIC_PARK_SPACES.map((space) => (
        <SpaceTile key={space.id} space={space} />
      ))}

      {/* Decorative trees around the board */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 16
        const r = 14
        const x = Math.cos(angle) * r
        const z = Math.sin(angle) * r
        return <Tree key={`tree-${i}`} position={[x, 0, z]} />
      })}

      {/* Center star */}
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh position={[0, 2.5, 0]} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ffb000"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
      </Float>

      {/* Clouds */}
      <group ref={cloudsRef}>
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2
          const r = 22
          return (
            <Cloud
              key={`cloud-${i}`}
              position={[
                Math.cos(angle) * r,
                8 + ((i * 1.7) % 3),
                Math.sin(angle) * r,
              ]}
            />
          )
        })}
      </group>
    </group>
  )
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1]} />
        <meshStandardMaterial color="#6b4423" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#2d7a3d" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <coneGeometry args={[0.7, 1.4, 8]} />
        <meshStandardMaterial color="#3a8a4a" roughness={0.85} />
      </mesh>
    </group>
  )
}

function Cloud({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[1.2, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh position={[1, 0.2, 0]}>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh position={[-1, 0.1, 0.3]}>
        <sphereGeometry args={[0.8, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
    </group>
  )
}
