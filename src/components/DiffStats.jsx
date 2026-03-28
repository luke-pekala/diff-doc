import React from 'react'
import { cn } from '../lib/utils'

export default function DiffStats({ stats }) {
  const { insertedChars, deletedChars, similarity, changedSegments, insertedLines, deletedLines } = stats

  const simColor = similarity >= 80 ? '#16a34a' : similarity >= 40 ? '#d97706' : '#dc2626'
  const simTextClass = similarity >= 80
    ? 'text-emerald-600 dark:text-emerald-400'
    : similarity >= 40 ? 'text-amber-600 dark:text-amber-400'
    : 'text-destructive'

  return (
    <div className="flex items-center px-4 py-1.5 bg-card border-b border-border flex-wrap animate-fade-up">
      {[
        { val: `+${insertedChars.toLocaleString()}`, label: 'chars added', cls: 'text-emerald-600 dark:text-emerald-400' },
        { val: `−${deletedChars.toLocaleString()}`, label: 'chars removed', cls: 'text-destructive' },
        { val: `+${insertedLines}`, label: 'lines added', cls: 'text-emerald-600 dark:text-emerald-400' },
        { val: `−${deletedLines}`, label: 'lines removed', cls: 'text-destructive' },
        { val: changedSegments, label: 'changes', cls: 'text-foreground' },
      ].map((s, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div className="w-px h-7 bg-border mx-1 flex-shrink-0" />}
          <div className="flex flex-col items-center px-3 py-1 gap-0.5">
            <span className={cn('text-base font-bold leading-none', s.cls)}>{s.val}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</span>
          </div>
        </React.Fragment>
      ))}
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-0.5 pl-4 border-l border-border">
        <div className="relative w-11 h-11 flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={simColor} strokeWidth="3"
              strokeDasharray={`${similarity} 100`} strokeLinecap="round"
              transform="rotate(-90 18 18)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
          </svg>
          <span className={cn('text-[11px] font-bold relative z-10', simTextClass)}>{similarity}%</span>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">similarity</span>
      </div>
    </div>
  )
}
