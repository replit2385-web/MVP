export function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ cursor: 'pointer' }}
      />
      <span style={{ fontSize: 13 }}>{label}</span>
    </label>
  )
}
