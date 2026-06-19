export function CheckRow({ checked, onChange, label, hint }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 2, cursor: 'pointer', accentColor: '#7c3aed' }}
      />
      <div>
        <label style={{ display: 'block', cursor: 'pointer', fontSize: 13, marginBottom: 2 }}>
          {label}
        </label>
        {hint && <p style={{ fontSize: 11, color: '#64748b' }}>{hint}</p>}
      </div>
    </div>
  )
}
