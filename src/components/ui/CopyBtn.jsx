export function CopyBtn({ text, id, copied }) {
  const isCopied = copied === id
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        copied?.(id)
      }}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        border: '1px solid rgba(124,58,237,0.4)',
        background: isCopied ? 'rgba(34,197,94,0.2)' : 'rgba(124,58,237,0.1)',
        color: isCopied ? '#22c55e' : '#c4b5fd',
        cursor: 'pointer',
        fontSize: 12,
        transition: 'all 0.2s',
        fontWeight: 500,
      }}
    >
      {isCopied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
