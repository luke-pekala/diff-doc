import React from 'react'

export default function DiffStats({ stats, isMobile }) {
  const { insertedChars, deletedChars, similarity, changedSegments, insertedLines, deletedLines } = stats

  const simFg = similarity >= 80 ? '#6ee7b7' : similarity >= 40 ? '#fcd34d' : '#fca5a5'
  const simStroke = similarity >= 80 ? '#34d399' : similarity >= 40 ? '#fbbf24' : '#f87171'

  // Mobile: show fewer stats
  const mobileStats = [
    { val: `+${insertedChars.toLocaleString()}`, label: 'Added', fg: '#86efac' },
    { val: `−${deletedChars.toLocaleString()}`, label: 'Removed', fg: '#fca5a5' },
    { val: changedSegments, label: 'Changes', fg: '#93c5fd' },
  ]

  const desktopStats = [
    { val: `+${insertedChars.toLocaleString()}`, label: 'Added', fg: '#86efac' },
    { val: `−${deletedChars.toLocaleString()}`, label: 'Removed', fg: '#fca5a5' },
    { val: `+${insertedLines}`, label: 'Lines +', fg: '#86efac' },
    { val: `−${deletedLines}`, label: 'Lines −', fg: '#fca5a5' },
    { val: changedSegments, label: 'Changes', fg: '#93c5fd' },
  ]

  const statsToShow = isMobile ? mobileStats : desktopStats

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? `repeat(${statsToShow.length}, 1fr) auto` : `repeat(${statsToShow.length}, 1fr) auto`,
      borderBottom: '1px solid var(--border)', background: 'var(--card)',
      animation: 'fade-up 0.3s var(--ease-out) both', overflowX: 'auto'
    }}>
      {statsToShow.map((s, i) => (
        <div key={i} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? '0.625rem 0.25rem' : '0.75rem 0.5rem',
          borderRight: '1px solid var(--border)', gap: '0.15rem', minWidth: isMobile ? 60 : 80
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.9375rem' : '1.125rem', fontWeight: 500, color: s.fg, lineHeight: 1 }}>{s.val}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--muted-foreground)' }}>{s.label}</span>
        </div>
      ))}

      {/* Similarity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '0.875rem', padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1.25rem' }}>
        <div style={{ position: 'relative', width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, flexShrink: 0 }}>
          <svg viewBox="0 0 36 36" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--secondary)" strokeWidth="3"/>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={simStroke} strokeWidth="3"
              strokeDasharray={`${similarity} 100`} strokeLinecap="round"
              transform="rotate(-90 18 18)" style={{ transition: 'stroke-dasharray 0.5s var(--ease-out)' }}/>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 500, color: simFg }}>{similarity}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.875rem' : '1rem', fontWeight: 500, color: simFg, lineHeight: 1 }}>{similarity}%</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--muted-foreground)' }}>Similarity</span>
        </div>
      </div>
    </div>
  )
}
