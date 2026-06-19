import { useState } from 'react'
import { INITIAL_TRACK } from '../constants'

export function useTrack() {
  const [track, setTrack] = useState(INITIAL_TRACK)

  const updateTrack = (updates) => {
    setTrack(prev => ({ ...prev, ...updates }))
  }

  const resetTrack = () => {
    setTrack(INITIAL_TRACK)
  }

  return {
    track,
    updateTrack,
    resetTrack,
  }
}
