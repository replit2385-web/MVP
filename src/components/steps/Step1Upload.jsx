import { useRef, useCallback } from 'react'
import { S } from '../../styles/tokens'
import { SectionHead } from '../ui/SectionHead'
import { ContentBox } from '../ui/ContentBox'
import { formatters } from '../../utils/formatters'
import { useBPM } from '../../hooks/useBPM'

export function Step1Upload({ track, onTrackUpdate, onStepChange }) {
  const fileRef = useRef()
  const { detectBPM, bpmStatus } = useBPM()

  const handleFile = async (file) => {
    if (!file) return

    const ext = file.name.split('.').pop().toLowerCase()
    if (!['mp3', 'wav', 'flac', 'm4a', 'aac'].includes(ext)) {
      alert('Upload MP3, WAV, FLAC, or M4A')
      return
    }

    const url = URL.createObjectURL(file)
    const audio = new Audio(url)

    await new Promise((res) => audio.addEventListener('loadedmetadata', res, { once: true }))

    const clean = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

    onTrackUpdate({
      file,
      fileName: file.name,
      duration: audio.duration,
      fileSize: file.size,
      format: ext.toUpperCase(),
      title: clean,
    })

    URL.revokeObjectURL(url)

    const bpm = await detectBPM(file)
    if (bpm) {
      onTrackUpdate({ bpm })
    }
  }

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      handleFile(e.dataTransfer.files[0])
    },
    []
  )

  const onDragOver = useCallback((e) => e.preventDefault(), [])

  const canContinue = track.file && track.title && track.bpmStatus !== 'analyzing'

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
      <SectionHead subtitle="Drop your Suno audio file below">
        · Upload Audio
      </SectionHead>

      <ContentBox
        style={{
          ...S.card,
          ...S.infoCard,
          padding: 32,
          textAlign: 'center',
          border: track.file ? '2px solid rgba(34,197,94,0.4)' : '2px dashed rgba(124,58,237,0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => fileRef.current?.click()}
      >
        <div>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎵</div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            {track.file ? '✓ File Loaded' : 'Drop Your Track Here'}
          </p>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            {track.file ? track.fileName : 'MP3, WAV, FLAC, M4A supported'}
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          onChange={(e) => handleFile(e.target.files?.[0])}
          accept=".mp3,.wav,.flac,.m4a,.aac"
          style={{ display: 'none' }}
        />
      </ContentBox>

      {track.file && (
        <ContentBox title="Track Details">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              fontSize: 13,
            }}
          >
            <div>
              <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>DURATION</p>
              <p style={{ fontWeight: 600 }}>{formatters.duration(track.duration)}</p>
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>SIZE</p>
              <p style={{ fontWeight: 600 }}>{formatters.fileSize(track.fileSize)}</p>
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>FORMAT</p>
              <p style={{ fontWeight: 600 }}>{track.format}</p>
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>BPM</p>
              <p style={{ fontWeight: 600, color: bpmStatus === 'done' ? '#22c55e' : '#f1f5f9' }}>
                {bpmStatus === 'analyzing' ? '🔍 Detecting...' : track.bpm || 'Unknown'}
              </p>
            </div>
          </div>
        </ContentBox>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          onClick={() => onStepChange(2)}
          disabled={!canContinue}
          style={{
            flex: 1,
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            background: canContinue ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.1)',
            color: canContinue ? '#c4b5fd' : '#64748b',
            cursor: canContinue ? 'pointer' : 'not-allowed',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          Continue → Metadata
        </button>
      </div>
    </div>
  )
}
