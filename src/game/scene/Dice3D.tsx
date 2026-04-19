'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  show: boolean
  value: number | null
  anchor: [number, number, number]
  onSettled?: () => void
}

const DURATION = 1.6

/**
 * Visual-only dice: tumbles in the air then lands showing `value`.
 * The engine already decided the value via seeded RNG — this just animates.
 */
export function Dice3D({ show, value, anchor, onSettled }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const startTime = useRef<number | null>(null)
  const settledRef = useRef(false)

  useEffect(() => {
    if (show && value != null) {
      startTime.current = performance.now() / 1000
      settledRef.current = false
    } else {
      startTime.current = null
    }
  }, [show, value])

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    if (!show || value == null || startTime.current == null) {
      g.visible = false
      return
    }
    g.visible = true

    const now = performance.now() / 1000
    const t = Math.min(1, (now - startTime.current) / DURATION)
    const ease = 1 - Math.pow(1 - t, 3)

    // Arc: rises then falls to anchor
    g.position.x = anchor[0]
    g.position.z = anchor[2]
    g.position.y = anchor[1] + 3 - Math.abs(Math.sin(t * Math.PI)) * -2 + (1 - t) * 3

    // Correct: ease from high point to anchor
    g.position.y = anchor[1] + 3 * (1 - ease) + 1.2

    if (t < 0.95) {
      g.rotation.x += 0.28 + t * 0.1
      g.rotation.y += 0.34 + t * 0.08
      g.rotation.z += 0.22
    } else {
      // Snap to face showing the rolled value
      const { x, y, z } = faceRotationFor(value)
      g.rotation.x += (x - g.rotation.x) * 0.25
      g.rotation.y += (y - g.rotation.y) * 0.25
      g.rotation.z += (z - g.rotation.z) * 0.25
    }

    if (t >= 1 && !settledRef.current) {
      settledRef.current = true
      onSettled?.()
    }
  })

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.1} />
      </mesh>
      {/* Pips via small spheres on each face */}
      {DIE_FACES.map((face, i) => (
        <group key={i}>
          {face.pips.map((p, j) => (
            <mesh
              key={j}
              position={[
                face.axis[0] * 0.46 + face.u[0] * p[0] + face.v[0] * p[1],
                face.axis[1] * 0.46 + face.u[1] * p[0] + face.v[1] * p[1],
                face.axis[2] * 0.46 + face.u[2] * p[0] + face.v[2] * p[1],
              ]}
            >
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color="#0a0a1a" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// Pip positions on each face (value 1..6). Face normals: +X, -X, +Y, -Y, +Z, -Z
interface Face {
  value: number
  axis: [number, number, number]
  u: [number, number, number]
  v: [number, number, number]
  pips: [number, number][]
}

const PIP_O = 0.22
const DIE_FACES: Face[] = [
  // +Z face = 1
  { value: 1, axis: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], pips: [[0, 0]] },
  // -Z face = 6
  {
    value: 6,
    axis: [0, 0, -1],
    u: [-1, 0, 0],
    v: [0, 1, 0],
    pips: [
      [-PIP_O, PIP_O],
      [0, PIP_O],
      [PIP_O, PIP_O],
      [-PIP_O, -PIP_O],
      [0, -PIP_O],
      [PIP_O, -PIP_O],
    ],
  },
  // +X face = 2
  {
    value: 2,
    axis: [1, 0, 0],
    u: [0, 0, -1],
    v: [0, 1, 0],
    pips: [
      [-PIP_O, -PIP_O],
      [PIP_O, PIP_O],
    ],
  },
  // -X face = 5
  {
    value: 5,
    axis: [-1, 0, 0],
    u: [0, 0, 1],
    v: [0, 1, 0],
    pips: [
      [-PIP_O, PIP_O],
      [PIP_O, PIP_O],
      [0, 0],
      [-PIP_O, -PIP_O],
      [PIP_O, -PIP_O],
    ],
  },
  // +Y face = 3
  {
    value: 3,
    axis: [0, 1, 0],
    u: [1, 0, 0],
    v: [0, 0, -1],
    pips: [
      [-PIP_O, PIP_O],
      [0, 0],
      [PIP_O, -PIP_O],
    ],
  },
  // -Y face = 4
  {
    value: 4,
    axis: [0, -1, 0],
    u: [1, 0, 0],
    v: [0, 0, 1],
    pips: [
      [-PIP_O, PIP_O],
      [PIP_O, PIP_O],
      [-PIP_O, -PIP_O],
      [PIP_O, -PIP_O],
    ],
  },
]

function faceRotationFor(value: number): { x: number; y: number; z: number } {
  // Rotate cube so +Y (top) shows `value`
  switch (value) {
    case 1: return { x: -Math.PI / 2, y: 0, z: 0 }          // +Z -> +Y
    case 6: return { x: Math.PI / 2, y: 0, z: 0 }
    case 2: return { x: 0, y: 0, z: -Math.PI / 2 }          // +X -> +Y
    case 5: return { x: 0, y: 0, z: Math.PI / 2 }
    case 3: return { x: 0, y: 0, z: 0 }                     // +Y already up
    case 4: return { x: Math.PI, y: 0, z: 0 }
    default: return { x: 0, y: 0, z: 0 }
  }
}
