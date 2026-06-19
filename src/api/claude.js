const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

// Get API key from environment or window
const getApiKey = () => {
  return import.meta.env.VITE_ANTHROPIC_API_KEY || window.ANTHROPIC_API_KEY || ''
}

const callClaude = async (messages) => {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('Anthropic API key not configured')
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Claude API error')
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

export const genMeta = async (track) => {
  const prompt = `Music metadata expert, hip-hop/R&B focus. Generate streaming metadata for this AI-assisted track.
Track: "${track.title}" | BPM: ${track.bpm || 'unknown'} | Genre: ${track.genre} | File: ${track.fileName}

Return ONLY valid JSON, no markdown, no commentary:
{"titleSuggestions":["option1","option2","option3"],"subgenre":"specific subgenre string","mood":"3-4 comma-separated mood words","key":"e.g. F# minor or C major","description":"90 char max streaming description, no quotes","seoKeywords":["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8"]}`

  const text = await callClaude([{ role: 'user', content: prompt }])
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

export const genSocial = async (track) => {
  const prompt = `Generate social media release content. Producer voice — authentic, not corporate.
"${track.title}" by ${track.artist || 'Independent'} | ${track.genre}${track.subgenre ? ' / ' + track.subgenre : ''} | ${track.mood || 'instrumental'} | ${track.bpm || '?'} BPM | AI-assisted (Suno Pro)

Return ONLY valid JSON, no markdown:
{"tiktokCaption":"<130 chars caption then 5 hashtags on separate lines","youtubeVideoTitle":"SEO title: BPM + mood + genre + FREE","youtubeDescription":"~200 word description: vibe, BPM/key, use permissions, 8 hashtags at end","instagramCaption":"85-100 chars + 8 targeted hashtags","submithubPitch":"3 sentences, specific about the sound and target playlist","twitterPost":"<240 chars + 3 hashtags"}`

  const text = await callClaude([{ role: 'user', content: prompt }])
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}
