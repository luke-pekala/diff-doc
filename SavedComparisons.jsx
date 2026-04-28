import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export default function SavedComparisons({ onLoad, isMobile }) {
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

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        height: '2.25rem', padding: isMobile ? '0 0.6rem' : '0 0.75rem',
        borderRadius: 'var(--radius-md)', background: 'var(--secondary)',
        border: '1px solid var(--border)', fontFamily: 'var(--font-sans)',
        fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)', cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M6 3.5v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        {!isMobile && 'History'}
        {comparisons.length > 0 && !open && (
          <span style={{
            minWidth: '1.2em', height: '1.2em', borderRadius: '999px',
            background: 'var(--foreground)', color: 'var(--background)',
            fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 0.3em'
          }}>{comparisons.length}</span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop — full screen on mobile as bottom sheet */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: isMobile ? 'rgba(0,0,0,0.5)' : 'transparent' }} onClick={() => setOpen(false)} />

          <div style={isMobile ? {
            // Bottom sheet on mobile
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
            background: 'var(--popover-bg)', border: '1px solid var(--popover-border)',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            boxShadow: 'var(--popover-shadow)',
            animation: 'fade-up 0.25s var(--ease-out) both',
            paddingBottom: 'env(safe-area-inset-bottom)',
          } : {
            // Dropdown on desktop
            position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
            width: 380, background: 'var(--popover-bg)',
            border: '1px solid var(--popover-border)',
            borderRadius: 'var(--radius-xl)', boxShadow: 'var(--popover-shadow)',
            zIndex: 50, overflow: 'hidden',
            animation: 'fade-up 0.2s var(--ease-out) both',
          }}>
            {/* Drag handle */}
            {isMobile && <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0.75rem auto 0' }} />}

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--foreground)' }}>Saved Comparisons</span>
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', color: 'var(--muted-foreground)',
                cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem',
                WebkitTapHighlightColor: 'transparent',
              }}>×</button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2.5rem', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                <span style={{ width: 12, height: 12, border: '1.5px solid var(--border)', borderTopColor: 'var(--ring)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Loading…
              </div>
            ) : comparisons.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                No saved comparisons yet.<br />Run a diff and tap Save.
              </div>
            ) : (
              <div style={{ maxHeight: isMobile ? '60vh' : 360, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {comparisons.map(c => (
                  <div key={c.id} onClick={() => handleLoad(c.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: isMobile ? '1rem' : '0.75rem 1rem',
                    borderBottom: '1px solid var(--border)', cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                    onMouseEnter={e => { if (!isMobile) e.currentTarget.style.background = 'var(--secondary)' }}
                    onMouseLeave={e => { if (!isMobile) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: isMobile ? '0.9375rem' : '0.8125rem', fontWeight: 500, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || 'Untitled'}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 500, color: simFg(c.similarity), flexShrink: 0 }}>{c.similarity}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.file_a} → {c.file_b}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)', flexShrink: 0 }}>{formatDate(c.created_at)}</span>
                      </div>
                    </div>
                    <button onClick={e => handleDelete(e, c.id)} disabled={deleting === c.id} style={{
                      width: isMobile ? '2.5rem' : 'auto', height: isMobile ? '2.5rem' : 'auto',
                      background: 'none', border: 'none', color: 'var(--muted-foreground)',
                      cursor: 'pointer', fontSize: '1rem', lineHeight: 1, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      WebkitTapHighlightColor: 'transparent',
                    }}>{deleting === c.id ? '…' : '×'}</button>
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
