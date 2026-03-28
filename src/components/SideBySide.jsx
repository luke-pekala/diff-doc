import React, { useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { renderLeftPane, renderRightPane } from '../utils/diffEngine'
import { cn } from '../lib/utils'

const SideBySide = forwardRef(function SideBySide({ diffs, leftLabel, rightLabel, currentChange }, ref) {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const syncingRef = useRef(false)

  const leftSegments = renderLeftPane(diffs)
  const rightSegments = renderRightPane(diffs)
  const totalChanges = diffs.filter(([op]) => op !== 0).length

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

  const renderSegments = (segments) => {
    let changeIndex = 0
    return segments.map((seg, i) => {
      if (seg.type === 'del') {
        const idx = seg.changeIndex ?? changeIndex++
        return (
          <span key={i} className={cn('diff-del', currentChange === idx && 'diff-active')} data-change-index={idx}>
            {seg.text}
          </span>
        )
      }
      if (seg.type === 'ins') {
        const idx = seg.changeIndex ?? changeIndex++
        return (
          <span key={i} className={cn('diff-ins', currentChange === idx && 'diff-active')} data-change-index={idx}>
            {seg.text}
          </span>
        )
      }
      return <span key={i}>{seg.text}</span>
    })
  }

  return (
    <div className="flex h-full overflow-hidden animate-fade-up bg-background">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border border-t-2 border-t-violet-500 flex-shrink-0">
          <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">{leftLabel || 'Original'}</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-500">Original</span>
        </div>
        <div className="flex-1 overflow-y-auto p-5" ref={leftRef} onScroll={handleLeftScroll}>
          <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground m-0">
            {renderSegments(leftSegments)}
          </pre>
        </div>
      </div>

      <div className="w-px bg-border flex-shrink-0" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border border-t-2 border-t-emerald-500 flex-shrink-0">
          <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">{rightLabel || 'Revised'}</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">Revised</span>
        </div>
        <div className="flex-1 overflow-y-auto p-5" ref={rightRef} onScroll={handleRightScroll}>
          <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground m-0">
            {renderSegments(rightSegments)}
          </pre>
        </div>
      </div>
    </div>
  )
})

export default SideBySide
