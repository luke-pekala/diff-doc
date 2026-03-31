import React from 'react'

export default function DiffStats({ stats }) {
  const { insertedChars, deletedChars, similarity, changedSegments, insertedLines, deletedLines } = stats

  const simBg  = similarity >= 80 ? 'rgba(52,211,153,.10)' : similarity >= 40 ? 'rgba(251,191,36,.10)' : 'rgba(248,113,113,.12)'
  const simFg  = similarity >= 80 ? '#6ee7b7' : similarity >= 40 ? '#fcd34d' : '#fca5a5'
  const simStroke = similarity >= 80 ? '#34d399' : similarity >= 40 ? '#fbbf24' : '#f87171'

  const stats_data = [
    { val: `+${insertedChars.toLocaleString()}`, label: 'Added', bg: 'rgba(74,222,128,.10)', fg: '#86efac' },
    { val: `−${deletedChars.toLocaleString()}`, label: 'Removed', bg: 'rgba(248,113,113,.12)', fg: '#fca5a5' },
    { val: `+${insertedLines}`, label: 'Lines +', bg: 'rgba(74,222,128,.10)', fg: '#86efac' },
    { val: `−${deletedLines}`, label: 'Lines −', bg: 'rgba(248,113,113,.12)', fg: '#fca5a5' },
    { val: changedSegments, label: 'Changes', bg: 'rgba(96,165,250,.10)', fg: '#93c5fd' },
  ]

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto',
      borderBottom: '1px solid var(--border)', background: 'var(--card)',
      animation: 'fade-up 0.3s var(--ease-out) both'
    }}>
      {stats_data.map((s, i) => (
        <div key={i} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '0.75rem 0.5rem', borderRight: '1px solid var(--border)', gap: '0.2rem'
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 500, color: s.fg, lineHeight: 1 }}>{s.val}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)', letterSpacing: '0.02em' }}>{s.label}</span>
        </div>
      ))}

      {/* Similarity */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        padding: '0.5rem 1.25rem'
      }}>
        <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
          <svg viewBox="0 0 36 36" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--secondary)" strokeWidth="3"/>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={simStroke} strokeWidth="3"
              strokeDasharray={`${similarity} 100`} strokeLinecap="round"
              transform="rotate(-90 18 18)" style={{ transition: 'stroke-dasharray 0.5s var(--ease-out)' }}/>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 500, color: simFg }}>{similarity}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 500, color: simFg, lineHeight: 1 }}>{similarity}%</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>Similarity</span>
        </div>
      </div>
    </div>
  )
}
