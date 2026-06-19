import { useState } from 'react'

export function useBPM() {
  const [bpmStatus, setBpmStatus] = useState('')

  const detectBPM = async (file) => {
    setBpmStatus('analyzing')
    try {
      const ab = await file.arrayBuffer()
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const buf = await ctx.decodeAudioData(ab)
      const sr = buf.sampleRate
      const raw = buf.getChannelData(0)
      const cap = Math.min(raw.length, sr * 45)
      const win = Math.floor(sr * 0.025)
      const energies = []

      for (let i = 0; i < cap - win; i += win) {
        let e = 0
        for (let j = i; j < i + win; j++) e += raw[j] * raw[j]
        energies.push(e / win)
      }

      const avg = energies.reduce((a, b) => a + b, 0) / energies.length
      const thresh = avg * 1.35
      const peaks = []

      for (let i = 3; i < energies.length - 3; i++) {
        if (
          energies[i] > thresh &&
          energies[i] >= energies[i - 1] &&
          energies[i] >= energies[i + 1] &&
          energies[i] >= energies[i - 2] &&
          energies[i] >= energies[i + 2]
        ) {
          if (!peaks.length || i - peaks[peaks.length - 1] > 4) peaks.push(i)
        }
      }

      if (peaks.length < 4) {
        setBpmStatus('failed')
        ctx.close()
        return null
      }

      const ivls = []
      for (let i = 1; i < peaks.length; i++) ivls.push(peaks[i] - peaks[i - 1])
      ivls.sort((a, b) => a - b)

      const med = ivls[Math.floor(ivls.length / 2)]
      let bpm = Math.round(60 / ((med * win) / sr))

      while (bpm > 180) bpm = Math.round(bpm / 2)
      while (bpm < 55) bpm *= 2

      ctx.close()
      setBpmStatus('done')
      return String(Math.min(200, Math.max(55, bpm)))
    } catch (e) {
      console.error('BPM detection error:', e)
      setBpmStatus('failed')
      return null
    }
  }

  return { detectBPM, bpmStatus }
}
