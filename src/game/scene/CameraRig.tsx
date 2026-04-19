'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  targetPosition: [number, number, number]
  shakeIntensity?: number  // 0..1
}

/**
 * Smoothly lerps the camera around a target to a slight orbit overlook.
 * External code updates `targetPosition` (e.g., to the active player's space).
 */
export function CameraRig({ targetPosition, shakeIntensity = 0 }: Props) {
  const { camera } = useThree()
  const lookTarget = useRef(new THREE.Vector3())
  const smoothed = useRef(new THREE.Vector3(...targetPosition))
  const orbitAngle = useRef(0)

  useFrame((_, delta) => {
    // Smoothly chase target
    smoothed.current.x += (targetPosition[0] - smoothed.current.x) * Math.min(1, delta * 2.4)
    smoothed.current.y += (targetPosition[1] - smoothed.current.y) * Math.min(1, delta * 2.4)
    smoothed.current.z += (targetPosition[2] - smoothed.current.z) * Math.min(1, delta * 2.4)

    // Slow orbit
    orbitAngle.current += delta * 0.08

    const camR = 11
    const camH = 9
    const cx = smoothed.current.x + Math.cos(orbitAngle.current) * camR * 0.35
    const cz = smoothed.current.z + Math.sin(orbitAngle.current) * camR * 0.35 + camR
    const cy = camH + smoothed.current.y

    // Shake
    const sx = shakeIntensity > 0 ? (Math.random() - 0.5) * shakeIntensity * 0.4 : 0
    const sy = shakeIntensity > 0 ? (Math.random() - 0.5) * shakeIntensity * 0.4 : 0

    camera.position.set(cx + sx, cy + sy, cz)
    lookTarget.current.copy(smoothed.current)
    camera.lookAt(lookTarget.current)
  })

  return null
}
