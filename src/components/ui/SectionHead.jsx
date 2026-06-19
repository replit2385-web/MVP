export function SectionHead({ children, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{children}</h2>
      {subtitle && <p style={{ fontSize: 12, color: '#64748b' }}>{subtitle}</p>}
    </div>
  )
}
