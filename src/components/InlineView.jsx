import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import { renderInlineDiff } from '../utils/diffEngine'
import { cn } from '../lib/utils'

const InlineView = forwardRef(function InlineView({ diffs, currentChange }, ref) {
  const containerRef = useRef(null)
  const segments = renderInlineDiff(diffs)
  let changeIndex = 0

  const tagged = segments.map((seg, i) => {
    if (seg.type === 'ins') {
      const idx = changeIndex++
      return (
        <span key={i} className={cn('diff-ins', currentChange === idx && 'diff-active')} data-change-index={idx}>
          {seg.text}
        </span>
      )
    } else if (seg.type === 'del') {
      const idx = changeIndex++
      return (
        <span key={i} className={cn('diff-del', currentChange === idx && 'diff-active')} data-change-index={idx}>
          {seg.text}
        </span>
      )
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
    <div className="h-full overflow-y-auto p-6 animate-fade-up bg-background" ref={containerRef}>
      <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground">{tagged}</pre>
    </div>
  )
})

export default InlineView
