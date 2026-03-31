import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export default function SavedComparisons({ onLoad }) {
  const [comparisons, setComparisons] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [open, setOpen] = useState(false)

  const fetchComparisons = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('comparisons').select('id, title, file_a, file_b, similarity, created_at')
      .order('created_at', { ascending: false }).limit(50)
    if (!error && data) setComparisons(data)
    setLoading(false)
  }, [])

  useEffect(() => { if (open) fetchComparisons() }, [open, fetchComparisons])

  const handleLoad = async (id) => {
    const { data, error } = await supabase.from('comparisons').select('*').eq('id', id).single()
    if (!error && data) { onLoad(data); setOpen(false) }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation(); setDeleting(id)
    await supabase.from('comparisons').delete().eq('id', id)
    setComparisons(prev => prev.filter(c => c.id !== id))
    setDeleting(null)
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const simFg = (s) => s >= 80 ? '#6ee7b7' : s >= 40 ? '#fcd34d' : '#fca5a5'

  const triggerStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    height: '2rem', padding: '0 0.75rem', borderRadius: 'var(--radius-md)',
    background: 'var(--secondary)', border: '1px solid var(--border)',
    fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500,
    color: 'var(--foreground)', cursor: 'pointer',
    transition: 'background var(--dur-fast) var(--ease-out)'
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={triggerStyle}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M6 3.5v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        History
        {comparisons.length > 0 && !open && (
          <span style={{
            minWidth: '1.2em', height: '1.2em', borderRadius: '999px',
            background: 'var(--foreground)', color: 'var(--background)',
            fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 0.3em', lineHeight: 1
          }}>{comparisons.length}</span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
            width: 380, background: 'var(--popover-bg)', border: '1px solid var(--popover-border)',
            borderRadius: 'var(--radius-xl)', boxShadow: 'var(--popover-shadow)',
            zIndex: 50, overflow: 'hidden', animation: 'fade-up 0.2s var(--ease-out) both'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)' }}>Saved Comparisons</span>
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', color: 'var(--muted-foreground)',
                cursor: 'pointer', fontSize: '1rem', lineHeight: 1
              }}>×</button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2rem', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                <span style={{ width: 12, height: 12, border: '1.5px solid var(--border)', borderTopColor: 'var(--ring)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Loading…
              </div>
            ) : comparisons.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                No saved comparisons yet.<br />Run a diff and click Save.
              </div>
            ) : (
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {comparisons.map(c => (
                  <div key={c.id} onClick={() => handleLoad(c.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'background var(--dur-fast) var(--ease-out)'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || 'Untitled'}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500, color: simFg(c.similarity), flexShrink: 0 }}>{c.similarity}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.file_a} → {c.file_b}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)', flexShrink: 0 }}>{formatDate(c.created_at)}</span>
                      </div>
                    </div>
                    <button onClick={e => handleDelete(e, c.id)} disabled={deleting === c.id} style={{
                      background: 'none', border: 'none', color: 'var(--muted-foreground)',
                      cursor: 'pointer', fontSize: '0.875rem', lineHeight: 1, flexShrink: 0,
                      opacity: 0.5, transition: 'opacity var(--dur-fast) var(--ease-out)'
                    }}
                      onMouseEnter={e => e.target.style.opacity = 1}
                      onMouseLeave={e => e.target.style.opacity = 0.5}
                    >{deleting === c.id ? '…' : '×'}</button>
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
