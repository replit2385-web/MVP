import { useState } from 'react'
import { GENRES, MOODS } from '../../constants'
import { S } from '../../styles/tokens'
import { SectionHead } from '../ui/SectionHead'
import { ContentBox } from '../ui/ContentBox'
import { Field } from '../ui/Field'
import { TxtInput } from '../ui/TxtInput'
import { SelInput } from '../ui/SelInput'
import { AIBtn } from '../ui/AIBtn'
import { CopyBtn } from '../ui/CopyBtn'
import { GroupLabel } from '../ui/GroupLabel'
import { genMeta } from '../../api/claude'

export function Step2Metadata({ track, aiMeta, onAiMetaUpdate, onTrackUpdate, onStepChange, loading }) {
  const [copied, setCopied] = useState('')

  const handleGenMeta = async () => {
    try {
      const result = await genMeta(track)
      onAiMetaUpdate(result)
    } catch (error) {
      alert('Error generating metadata: ' + error.message)
    }
  }

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleApplyTitle = (title) => {
    onTrackUpdate({ title })
  }

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
      <SectionHead subtitle="Generate or edit streaming metadata with Claude AI">
        · Metadata
      </SectionHead>

      <ContentBox title="Quick Generate">
        <div style={{ display: 'flex', gap: 12 }}>
          <AIBtn
            onClick={handleGenMeta}
            loading={loading === 'meta'}
            label="Generate with Claude"
            icon="✨"
          />
          {aiMeta && <span style={{ color: '#22c55e', fontSize: 12 }}>✓ Generated</span>}
        </div>
      </ContentBox>

      {aiMeta?.titleSuggestions && (
        <ContentBox title="Title Suggestions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {aiMeta.titleSuggestions.map((title, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 10,
                  background: 'rgba(124,58,237,0.05)',
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 13 }}>{title}</span>
                <button
                  onClick={() => handleApplyTitle(title)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 4,
                    border: '1px solid rgba(124,58,237,0.3)',
                    background: 'transparent',
                    color: '#c4b5fd',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  Use This
                </button>
              </div>
            ))}
          </div>
        </ContentBox>
      )}

      <GroupLabel>Manual Entry</GroupLabel>

      <ContentBox>
        <Field label="Track Title">
          <TxtInput
            value={track.title}
            onChange={(v) => onTrackUpdate({ title: v })}
            placeholder="Song title"
          />
        </Field>
      </ContentBox>

      <ContentBox>
        <Field label="Artist Name">
          <TxtInput
            value={track.artist}
            onChange={(v) => onTrackUpdate({ artist: v })}
            placeholder="Your name or handle"
          />
        </Field>
      </ContentBox>

      <ContentBox>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Genre">
            <SelInput
              value={track.genre}
              onChange={(v) => onTrackUpdate({ genre: v })}
              options={GENRES}
            />
          </Field>
          <Field label="Subgenre">
            <TxtInput
              value={track.subgenre}
              onChange={(v) => onTrackUpdate({ subgenre: v })}
              placeholder={aiMeta?.subgenre || 'e.g. Trap Soul'}
            />
          </Field>
        </div>
      </ContentBox>

      <ContentBox>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Mood">
            <SelInput
              value={track.mood}
              onChange={(v) => onTrackUpdate({ mood: v })}
              options={MOODS}
            />
          </Field>
          <Field label="Key">
            <TxtInput
              value={track.key}
              onChange={(v) => onTrackUpdate({ key: v })}
              placeholder={aiMeta?.key || 'e.g. F# minor'}
            />
          </Field>
        </div>
      </ContentBox>

      <ContentBox title="Description">
        <textarea
          value={track.description}
          onChange={(e) => onTrackUpdate({ description: e.target.value })}
          placeholder={aiMeta?.description || 'Streaming description (max 90 chars)'}
          style={{
            ...S.input,
            height: 80,
            resize: 'none',
            fontFamily: 'monospace',
          }}
        />
        <p style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
          {track.description.length}/90 characters
        </p>
      </ContentBox>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          onClick={() => onStepChange(1)}
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
          onClick={() => onStepChange(3)}
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
          Continue → Distribute
        </button>
      </div>
    </div>
  )
}
