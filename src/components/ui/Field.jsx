import { S } from '../../styles/tokens'

export function Field({ label, hint, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}
