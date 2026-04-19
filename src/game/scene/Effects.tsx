'use client'

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export function GameEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.6}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.2} darkness={0.45} />
    </EffectComposer>
  )
}
