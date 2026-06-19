import { S } from '../../styles/tokens'

export function ContentBox({ title, style, children }) {
  return (
    <div style={{ ...S.card, padding: 16, marginBottom: 16, ...style }}>
      {title && <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{title}</h3>}
      {children}
    </div>
  )
}
