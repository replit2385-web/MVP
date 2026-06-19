export function GroupLabel({ children }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#64748b',
        marginTop: 20,
        marginBottom: 12,
        paddingTop: 12,
        borderTop: '1px solid rgba(124,58,237,0.1)',
      }}
    >
      {children}
    </p>
  )
}
