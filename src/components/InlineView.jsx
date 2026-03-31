import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import { renderInlineDiff } from '../utils/diffEngine'

const InlineView = forwardRef(function InlineView({ diffs, currentChange }, ref) {
  const containerRef = useRef(null)
  const segments = renderInlineDiff(diffs)
  let changeIndex = 0

  const tagged = segments.map((seg, i) => {
    if (seg.type === 'ins') {
      const idx = changeIndex++
      return <span key={i} className={`diff-ins${currentChange === idx ? ' diff-active' : ''}`} data-change-index={idx}>{seg.text}</span>
    } else if (seg.type === 'del') {
      const idx = changeIndex++
      return <span key={i} className={`diff-del${currentChange === idx ? ' diff-active' : ''}`} data-change-index={idx}>{seg.text}</span>
    }
    return <span key={i}>{seg.text}</span>
  })

  useImperativeHandle(ref, () => ({
    scrollToChange(index) {
      const el = containerRef.current?.querySelector(`[data-change-index="${index}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }))

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1.5rem', background: 'var(--background)' }} ref={containerRef}>
      <pre style={{
        fontFamily: 'var(--font-sans)', fontSize: '0.875rem', lineHeight: 1.75,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--foreground)', margin: 0
      }}>{tagged}</pre>
    </div>
  )
})

export default InlineView
