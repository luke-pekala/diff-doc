import React, { useState, useRef } from 'react'

export default function Tooltip({ type, index, total, children }) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef(null)

  const handleMouseEnter = (e) => {
    clearTimeout(timeoutRef.current)
    const rect = e.currentTarget.getBoundingClientRect()
    setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
    setVisible(true)
  }
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => setVisible(false), 100) }
  const isIns = type === 'ins'

  return (
    <>
      <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ position: 'relative' }}>
        {children}
      </span>
      {visible && (
        <div style={{
          position: 'fixed', left: pos.x, top: pos.y,
          transform: 'translate(-50%, -100%) translateY(-6px)',
          zIndex: 100, pointerEvents: 'none',
          background: 'var(--popover-bg)', border: '1px solid var(--popover-border)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--popover-shadow)',
          padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500, color: isIns ? '#86efac' : '#fca5a5' }}>
            {isIns ? '+ Added' : '− Removed'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)', borderLeft: '1px solid var(--border)', paddingLeft: '0.5rem' }}>
            {index + 1} / {total}
          </span>
        </div>
      )}
    </>
  )
}
