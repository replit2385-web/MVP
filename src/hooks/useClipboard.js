import { useState } from 'react'

export function useClipboard() {
  const [copied, setCopied] = useState('')

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  return { copy, copied }
}
