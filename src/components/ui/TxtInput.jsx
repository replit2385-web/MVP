import { S } from '../../styles/tokens'

export function TxtInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={S.input}
    />
  )
}
