import { useState } from 'react'
import { S } from '../../styles/tokens'
import { SectionHead } from '../ui/SectionHead'
import { ContentBox } from '../ui/ContentBox'
import { CheckRow } from '../ui/CheckRow'
import { GroupLabel } from '../ui/GroupLabel'

const LAUNCH_CHECKLIST = [
  {
    phase: 'Before Release (3 weeks)',
    items: [
      { id: 'upload-distro', label: 'Upload to DistroKid', hint: 'Verify all metadata is correct' },
      { id: 'create-playlists', label: 'Create release playlists', hint: 'Spotify, Apple Music, etc.' },
      { id: 'schedule-posts', label: 'Schedule social posts', hint: '3–7 days before launch' },
      { id: 'contact-playlists', label: 'Contact playlist curators', hint: 'Include pitch from Claude' },
      { id: 'register-bmi', label: 'Register with BMI/ASCAP', hint: 'Claim your royalties' },
    ],
  },
  {
    phase: 'Release Week',
    items: [
      { id: 'final-posts', label: 'Post final reminder', hint: 'All platforms 24 hrs before' },
      { id: 'check-distro', label: 'Verify live on all platforms', hint: 'Spot-check streaming URLs' },
      { id: 'youtube-upload', label: 'Upload lyric/visualizer video', hint: 'Link in all posts' },
      { id: 'announce-email', label: 'Send email to your list', hint: 'If you have subscribers' },
    ],
  },
  {
    phase: 'Post-Release (30 days)',
    items: [
      { id: 'share-links', label: 'Share streaming links', hint: 'Weekly for first month' },
      { id: 'engage', label: 'Engage with listeners', hint: 'Respond to comments, DMs' },
      { id: 'submithub', label: 'Monitor SubmitHub pitches', hint: 'Check for curator feedback' },
      { id: 'analytics', label: 'Check streaming analytics', hint: 'Identify playlist adds' },
      { id: 'thank-you', label: 'Thank playlist curators', hint: 'Build relationships' },
    ],
  },
]

export function Step5Launch({ onStepChange }) {
  const [checks, setChecks] = useState({})

  const toggleCheck = (id) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const totalItems = LAUNCH_CHECKLIST.reduce((sum, phase) => sum + phase.items.length, 0)
  const checkedItems = Object.values(checks).filter(Boolean).length
  const progressPercent = (checkedItems / totalItems) * 100

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
      <SectionHead subtitle="3-week pre-release → 30 days post-launch">
        · Launch
      </SectionHead>

      <ContentBox
        style={{
          ...S.successCard,
          padding: 16,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Progress</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>
              {checkedItems}/{totalItems}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: 8,
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: '#22c55e',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </ContentBox>

      {LAUNCH_CHECKLIST.map((phase) => (
        <div key={phase.phase}>
          <GroupLabel>{phase.phase}</GroupLabel>
          <ContentBox>
            {phase.items.map((item) => (
              <CheckRow
                key={item.id}
                checked={checks[item.id] || false}
                onChange={() => toggleCheck(item.id)}
                label={item.label}
                hint={item.hint}
              />
            ))}
          </ContentBox>
        </div>
      ))}

      <ContentBox
        style={{
          ...S.warnCard,
          padding: 16,
          marginTop: 24,
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#fed7aa' }}>
          💡 Tip: Keep this checklist open in another tab
        </p>
        <p style={{ fontSize: 12, color: '#fed7aa', lineHeight: 1.5 }}>
          Success isn't just upload. These 30 days are when listeners discover you. Stay consistent, engage
          genuinely, and your release will gain traction.
        </p>
      </ContentBox>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          onClick={() => onStepChange(4)}
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
          onClick={() => onStepChange(1)}
          style={{
            flex: 1,
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            background: 'rgba(34,197,94,0.2)',
            color: '#22c55e',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ✓ Start New Release
        </button>
      </div>
    </div>
  )
}
