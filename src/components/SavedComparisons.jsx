import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { History, X, Trash2, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'

export default function SavedComparisons({ onLoad }) {
  const [comparisons, setComparisons] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [open, setOpen] = useState(false)

  const fetchComparisons = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('comparisons')
      .select('id, title, file_a, file_b, similarity, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error && data) setComparisons(data)
    setLoading(false)
  }, [])

  useEffect(() => { if (open) fetchComparisons() }, [open, fetchComparisons])

  const handleLoad = async (id) => {
    const { data, error } = await supabase.from('comparisons').select('*').eq('id', id).single()
    if (!error && data) { onLoad(data); setOpen(false) }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    setDeleting(id)
    await supabase.from('comparisons').delete().eq('id', id)
    setComparisons(prev => prev.filter(c => c.id !== id))
    setDeleting(null)
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })

  const simClass = (s) => s >= 80 ? 'text-emerald-600' : s >= 40 ? 'text-amber-600' : 'text-destructive'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium transition-colors"
      >
        <History className="w-4 h-4" />
        History
        {comparisons.length > 0 && !open && (
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {comparisons.length > 9 ? '9+' : comparisons.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] w-96 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-sm font-semibold">Saved Comparisons</span>
              <button onClick={() => setOpen(false)} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-accent transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading…</div>
            ) : comparisons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <History className="w-8 h-8 opacity-30" />
                <p className="text-sm">No saved comparisons yet</p>
                <p className="text-xs">Run a diff and click Save</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto divide-y divide-border">
                {comparisons.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleLoad(c.id)}
                    className="group relative flex items-center gap-3 px-4 py-3 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{c.title || 'Untitled'}</span>
                        <span className={cn('text-sm font-bold flex-shrink-0', simClass(c.similarity))}>{c.similarity}%</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                          {c.file_a || 'Doc A'} → {c.file_b || 'Doc B'}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{formatDate(c.created_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={e => handleDelete(e, c.id)}
                      disabled={deleting === c.id}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all flex-shrink-0"
                    >
                      {deleting === c.id ? <span className="text-xs">…</span> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
