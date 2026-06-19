import { useState } from 'react'
import { S } from '../../styles/tokens'
import { SectionHead } from '../ui/SectionHead'
import { ContentBox } from '../ui/ContentBox'
import { CopyBtn } from '../ui/CopyBtn'
import { GroupLabel } from '../ui/GroupLabel'

export function Step3Distribute({ track, onStepChange }) {
  const [copied, setCopied] = useState('')

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const distroFields = [
    { label: 'Song Title', value: track.title },
    { label: 'Artist Name', value: track.artist },
    { label: 'Genre', value: track.genre },
    { label: 'Subgenre', value: track.subgenre },
    { label: 'BPM', value: track.bpm },
    { label: 'Key', value: track.key },
    { label: 'Mood', value: track.mood },
    { label: 'Description', value: track.description },
  ]

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
      <SectionHead subtitle="Copy each field directly into DistroKid">
        · Distribute
      </SectionHead>

      <ContentBox
        style={{
          ...S.warnCard,
          padding: 16,
        }}
      >
        <p style={{ fontSize: 13, color: '#fed7aa' }}>
          ⚠️ Remember: This is AI-assisted music. Include disclosure in your release notes.
        </p>
      </ContentBox>

      <GroupLabel>DistroKid Fields</GroupLabel>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {distroFields.map(
          (field) =>
            field.value && (
              <ContentBox key={field.label}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
                  {field.label}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <code
                    style={{
                      flex: 1,
                      padding: 8,
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 4,
                      fontSize: 12,
                      wordBreak: 'break-all',
                    }}
                  >
                    {field.value}
                  </code>
                  <button
                    onClick={() => handleCopy(field.value, field.label)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid rgba(124,58,237,0.4)',
                      background: copied === field.label ? 'rgba(34,197,94,0.2)' : 'rgba(124,58,237,0.1)',
                      color: copied === field.label ? '#22c55e' : '#c4b5fd',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                  >
                    {copied === field.label ? '✓' : 'Copy'}
                  </button>
                </div>
              </ContentBox>
            )
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          onClick={() => onStepChange(2)}
          style={{
            flex: 1,
            padding: '12px 24px',
            borderRadius: 8,
            border: '1px solid rgba(124,58,237,0.3)',
            background: 'transparent',
            color: '#c4b5fd',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => onStepChange(4)}
          style={{
            flex: 1,
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            background: 'rgba(124,58,237,0.3)',
            color: '#c4b5fd',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Continue → Social
        </button>
      </div>
    </div>
  )
}
