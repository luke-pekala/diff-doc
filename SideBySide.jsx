import React, { useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { renderLeftPane, renderRightPane } from '../utils/diffEngine'

const SideBySide = forwardRef(function SideBySide({ diffs, leftLabel, rightLabel, currentChange, isMobile }, ref) {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const syncingRef = useRef(false)

  const leftSegments = renderLeftPane(diffs)
  const rightSegments = renderRightPane(diffs)

  const handleLeftScroll = useCallback(() => {
    if (syncingRef.current) return
    syncingRef.current = true
    if (rightRef.current && leftRef.current) {
      const ratio = leftRef.current.scrollTop / (leftRef.current.scrollHeight - leftRef.current.clientHeight || 1)
      rightRef.current.scrollTop = ratio * (rightRef.current.scrollHeight - rightRef.current.clientHeight)
    }
    requestAnimationFrame(() => { syncingRef.current = false })
  }, [])

  const handleRightScroll = useCallback(() => {
    if (syncingRef.current) return
    syncingRef.current = true
    if (leftRef.current && rightRef.current) {
      const ratio = rightRef.current.scrollTop / (rightRef.current.scrollHeight - rightRef.current.clientHeight || 1)
      leftRef.current.scrollTop = ratio * (leftRef.current.scrollHeight - leftRef.current.clientHeight)
    }
    requestAnimationFrame(() => { syncingRef.current = false })
  }, [])

  useImperativeHandle(ref, () => ({
    scrollToChange(index) {
      const leftEl = leftRef.current?.querySelector(`[data-change-index="${index}"]`)
      const rightEl = rightRef.current?.querySelector(`[data-change-index="${index}"]`)
      if (leftEl) leftEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (rightEl) rightEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }))

  const renderSegments = (segments) => segments.map((seg, i) => {
    const idx = seg.changeIndex
    if (seg.type === 'del') return <span key={i} className={`diff-del${currentChange === idx ? ' diff-active' : ''}`} data-change-index={idx}>{seg.text}</span>
    if (seg.type === 'ins') return <span key={i} className={`diff-ins${currentChange === idx ? ' diff-active' : ''}`} data-change-index={idx}>{seg.text}</span>
    return <span key={i}>{seg.text}</span>
  })

  // On mobile, show panes stacked vertically instead of side by side
  const containerStyle = isMobile
    ? { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }
    : { display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--background)' }

  const paneStyle = isMobile
    ? { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }
    : { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }

  const paneHdr = (color) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.4rem 1rem', borderBottom: '1px solid var(--border)',
    background: 'var(--card)', flexShrink: 0, borderTop: `2px solid ${color}`
  })

  return (
    <div style={containerStyle}>
      <div style={paneStyle}>
        <div style={paneHdr('var(--ring)')}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leftLabel}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Original</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', WebkitOverflowScrolling: 'touch' }} ref={leftRef} onScroll={handleLeftScroll}>
          <pre style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--foreground)', margin: 0 }}>
            {renderSegments(leftSegments)}
          </pre>
        </div>
      </div>

      <div style={{ [isMobile ? 'height' : 'width']: 1, background: 'var(--border)', flexShrink: 0 }} />

      <div style={paneStyle}>
        <div style={paneHdr('#34d399')}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rightLabel}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Revised</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', WebkitOverflowScrolling: 'touch' }} ref={rightRef} onScroll={handleRightScroll}>
          <pre style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--foreground)', margin: 0 }}>
            {renderSegments(rightSegments)}
          </pre>
        </div>
      </div>
    </div>
  )
})

export default SideBySide
