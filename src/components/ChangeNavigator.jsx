import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export default function ChangeNavigator({ current, total, onPrev, onNext }) {
  if (total === 0) return null
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg px-1 py-1">
      <button
        onClick={onPrev}
        disabled={total === 0}
        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-background hover:shadow-sm disabled:opacity-30 transition-all"
        title="Previous change"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <div className="flex items-baseline gap-1 px-2">
        <span className="text-sm font-bold text-primary">{total === 0 ? 0 : current + 1}</span>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-sm font-semibold text-foreground">{total}</span>
        <span className="text-xs text-muted-foreground ml-1">changes</span>
      </div>
      <button
        onClick={onNext}
        disabled={total === 0}
        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-background hover:shadow-sm disabled:opacity-30 transition-all"
        title="Next change"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  )
}
