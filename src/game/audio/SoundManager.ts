'use client'

import { Howl } from 'howler'

type SfxKey = 'dice' | 'hop' | 'coin' | 'star' | 'win' | 'select' | 'correct' | 'wrong'

// Paths to audio assets. Files are optional — SoundManager no-ops silently if
// the file is missing, so the game stays fully playable without audio assets.
const SOURCES: Record<SfxKey, string> = {
  dice: '/game-sfx/dice.mp3',
  hop: '/game-sfx/hop.mp3',
  coin: '/game-sfx/coin.mp3',
  star: '/game-sfx/star.mp3',
  win: '/game-sfx/win.mp3',
  select: '/game-sfx/select.mp3',
  correct: '/game-sfx/correct.mp3',
  wrong: '/game-sfx/wrong.mp3',
}

class SoundManager {
  private cache = new Map<SfxKey, Howl>()
  private muted = false

  play(key: SfxKey, volume = 1) {
    if (this.muted) return
    try {
      let h = this.cache.get(key)
      if (!h) {
        h = new Howl({ src: [SOURCES[key]], volume, onloaderror: () => {} })
        this.cache.set(key, h)
      }
      h.volume(volume)
      h.play()
    } catch {
      // ignore — audio is non-critical
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted
  }

  isMuted() {
    return this.muted
  }
}

export const sounds = new SoundManager()
