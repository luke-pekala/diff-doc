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

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100)
  }

  const isIns = type === 'ins'

  return (
    <>
      <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ position: 'relative' }}>
        {children}
      </span>
      {visible && (
        <div
          className="fixed z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-popover border border-border shadow-lg text-popover-foreground pointer-events-none whitespace-nowrap"
          style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -100%) translateY(-6px)' }}
        >
          <span className={`text-xs font-bold ${isIns ? 'text-emerald-600' : 'text-destructive'}`}>
            {isIns ? '+ Added' : '− Removed'}
          </span>
          <span className="text-xs text-muted-foreground border-l border-border pl-2">
            change {index + 1} of {total}
          </span>
        </div>
      )}
    </>
  )
}
