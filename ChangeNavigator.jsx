import React from 'react'

export default function ChangeNavigator({ current, total, onPrev, onNext }) {
  if (total === 0) return null
  const btnStyle = (disabled) => ({
    width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)',
    background: 'var(--secondary)', border: '1px solid var(--border)',
    color: disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.875rem', fontWeight: 500,
    WebkitTapHighlightColor: 'transparent',
  })
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      background: 'var(--secondary)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '0.25rem'
    }}>
      <button onClick={onPrev} disabled={total === 0} style={btnStyle(total === 0)}>↑</button>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: '0.2rem', padding: '0 0.5rem',
        fontFamily: 'var(--font-mono)', fontSize: '0.8125rem'
      }}>
        <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>{total === 0 ? 0 : current + 1}</span>
        <span style={{ color: 'var(--muted-foreground)' }}>/</span>
        <span style={{ color: 'var(--muted-foreground)' }}>{total}</span>
      </div>
      <button onClick={onNext} disabled={total === 0} style={btnStyle(total === 0)}>↓</button>
    </div>
  )
}
