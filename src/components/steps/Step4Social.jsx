import { useState } from 'react'
import { S } from '../../styles/tokens'
import { SectionHead } from '../ui/SectionHead'
import { ContentBox } from '../ui/ContentBox'
import { AIBtn } from '../ui/AIBtn'
import { GroupLabel } from '../ui/GroupLabel'
import { genSocial } from '../../api/claude'

export function Step4Social({ track, social, onSocialUpdate, onStepChange, loading }) {
  const [copied, setCopied] = useState('')

  const handleGenSocial = async () => {
    try {
      const result = await genSocial(track)
      onSocialUpdate(result)
    } catch (error) {
      alert('Error generating social content: ' + error.message)
    }
  }

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
      <SectionHead subtitle="Generate authentic, platform-specific copy with Claude">
        · Social
      </SectionHead>

      <ContentBox title="Generate Content">
        <div style={{ display: 'flex', gap: 12 }}>
          <AIBtn
            onClick={handleGenSocial}
            loading={loading === 'social'}
            label="Generate Social Posts"
            icon="✨"
          />
          {social && <span style={{ color: '#22c55e', fontSize: 12 }}>✓ Generated</span>}
        </div>
      </ContentBox>

      {social && (
        <>
          <GroupLabel>TikTok</GroupLabel>
          <ContentBox>
            <textarea
              value={social.tiktokCaption || ''}
              readOnly
              style={{
                ...S.input,
                height: 100,
                resize: 'none',
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={() => handleCopy(social.tiktokCaption, 'tiktok')}
              style={{
                marginTop: 8,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid rgba(124,58,237,0.4)',
                background: copied === 'tiktok' ? 'rgba(34,197,94,0.2)' : 'rgba(124,58,237,0.1)',
                color: copied === 'tiktok' ? '#22c55e' : '#c4b5fd',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {copied === 'tiktok' ? '✓ Copied' : 'Copy'}
            </button>
          </ContentBox>

          <GroupLabel>YouTube</GroupLabel>
          <ContentBox>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              Video Title
            </p>
            <textarea
              value={social.youtubeVideoTitle || ''}
              readOnly
              style={{
                ...S.input,
                height: 60,
                resize: 'none',
                fontFamily: 'monospace',
                marginBottom: 12,
              }}
            />
            <button
              onClick={() => handleCopy(social.youtubeVideoTitle, 'yt-title')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid rgba(124,58,237,0.4)',
                background: copied === 'yt-title' ? 'rgba(34,197,94,0.2)' : 'rgba(124,58,237,0.1)',
                color: copied === 'yt-title' ? '#22c55e' : '#c4b5fd',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {copied === 'yt-title' ? '✓ Copied' : 'Copy Title'}
            </button>

            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginTop: 12, marginBottom: 8 }}>
              Description
            </p>
            <textarea
              value={social.youtubeDescription || ''}
              readOnly
              style={{
                ...S.input,
                height: 120,
                resize: 'none',
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={() => handleCopy(social.youtubeDescription, 'yt-desc')}
              style={{
                marginTop: 8,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid rgba(124,58,237,0.4)',
                background: copied === 'yt-desc' ? 'rgba(34,197,94,0.2)' : 'rgba(124,58,237,0.1)',
                color: copied === 'yt-desc' ? '#22c55e' : '#c4b5fd',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {copied === 'yt-desc' ? '✓ Copied' : 'Copy Description'}
            </button>
          </ContentBox>

          <GroupLabel>Instagram</GroupLabel>
          <ContentBox>
            <textarea
              value={social.instagramCaption || ''}
              readOnly
              style={{
                ...S.input,
                height: 100,
                resize: 'none',
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={() => handleCopy(social.instagramCaption, 'insta')}
              style={{
                marginTop: 8,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid rgba(124,58,237,0.4)',
                background: copied === 'insta' ? 'rgba(34,197,94,0.2)' : 'rgba(124,58,237,0.1)',
                color: copied === 'insta' ? '#22c55e' : '#c4b5fd',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {copied === 'insta' ? '✓ Copied' : 'Copy'}
            </button>
          </ContentBox>

          <GroupLabel>SubmitHub</GroupLabel>
          <ContentBox>
            <textarea
              value={social.submithubPitch || ''}
              readOnly
              style={{
                ...S.input,
                height: 100,
                resize: 'none',
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={() => handleCopy(social.submithubPitch, 'submit')}
              style={{
                marginTop: 8,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid rgba(124,58,237,0.4)',
                background: copied === 'submit' ? 'rgba(34,197,94,0.2)' : 'rgba(124,58,237,0.1)',
                color: copied === 'submit' ? '#22c55e' : '#c4b5fd',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {copied === 'submit' ? '✓ Copied' : 'Copy'}
            </button>
          </ContentBox>

          <GroupLabel>X (Twitter)</GroupLabel>
          <ContentBox>
            <textarea
              value={social.twitterPost || ''}
              readOnly
              style={{
                ...S.input,
                height: 80,
                resize: 'none',
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={() => handleCopy(social.twitterPost, 'twitter')}
              style={{
                marginTop: 8,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid rgba(124,58,237,0.4)',
                background: copied === 'twitter' ? 'rgba(34,197,94,0.2)' : 'rgba(124,58,237,0.1)',
                color: copied === 'twitter' ? '#22c55e' : '#c4b5fd',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {copied === 'twitter' ? '✓ Copied' : 'Copy'}
            </button>
          </ContentBox>
        </>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          onClick={() => onStepChange(3)}
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
          onClick={() => onStepChange(5)}
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
          Continue → Launch
        </button>
      </div>
    </div>
  )
}
