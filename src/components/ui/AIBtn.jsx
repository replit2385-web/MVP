export function AIBtn({ onClick, loading, label, icon = '✨' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '8px 16px',
        borderRadius: 8,
        border: '1px solid rgba(124,58,237,0.5)',
        background: 'rgba(124,58,237,0.2)',
        color: '#c4b5fd',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: 600,
        transition: 'all 0.2s',
        opacity: loading ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>{icon}</span>
      {label}
    </button>
  )
}
