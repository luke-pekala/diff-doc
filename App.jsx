import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { supabase } from './utils/supabase'
import AuthPage from './auth/AuthPage'
import DropZone from './components/DropZone'
import DiffStats from './components/DiffStats'
import InlineView from './components/InlineView'
import SideBySide from './components/SideBySide'
import ChangeNavigator from './components/ChangeNavigator'
import SavedComparisons from './components/SavedComparisons'
import { computeDiff, computeStats, exportDiffHTML } from './utils/diffEngine'

// ── Shared styles ──────────────────────────────────────────────
const S = {
  btn: (variant = 'ghost') => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
    height: '2.25rem', padding: '0 0.875rem',
    borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
    fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 500,
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    transition: 'background var(--dur-fast) var(--ease-out)',
    WebkitTapHighlightColor: 'transparent',
    ...(variant === 'primary'
      ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'transparent' }
      : { background: 'var(--secondary)', color: 'var(--foreground)' })
  }),
}

// ── Theme Toggle ───────────────────────────────────────────────
function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute('data-theme') || 'dark'
  )
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('dd-theme', next)
    setTheme(next)
  }
  return (
    <button onClick={toggle} aria-label="Toggle theme" style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      height: '2.25rem', padding: '0 0.75rem', borderRadius: '9999px',
      background: 'var(--secondary)', border: '1px solid var(--border)',
      color: 'var(--foreground)', fontFamily: 'var(--font-sans)',
      fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
    }}>
      {theme === 'dark'
        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75"/><line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/><line x1="2" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/><line x1="20" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
      }
      <span className="hide-xs">{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [leftFile, setLeftFile] = useState('')
  const [rightFile, setRightFile] = useState('')
  const [view, setView] = useState('side-by-side')
  const [hasRun, setHasRun] = useState(false)
  const [diffs, setDiffs] = useState(null)
  const [currentChange, setCurrentChange] = useState(0)
  const [saveStatus, setSaveStatus] = useState(null)
  const [saveTitle, setSaveTitle] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [mobilePane, setMobilePane] = useState('left') // 'left' | 'right' for mobile input
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const diffViewRef = useRef(null)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const handleCompare = useCallback(() => {
    if (!leftText.trim() && !rightText.trim()) return
    const result = computeDiff(leftText, rightText)
    setDiffs(result); setHasRun(true); setCurrentChange(0); setSaveStatus(null)
  }, [leftText, rightText])

  const stats = useMemo(() => diffs ? computeStats(diffs) : null, [diffs])
  const totalChanges = useMemo(() => diffs ? diffs.filter(([op]) => op !== 0).length : 0, [diffs])

  const handleNext = useCallback(() => {
    const next = (currentChange + 1) % totalChanges
    setCurrentChange(next); diffViewRef.current?.scrollToChange(next)
  }, [currentChange, totalChanges])

  const handlePrev = useCallback(() => {
    const prev = (currentChange - 1 + totalChanges) % totalChanges
    setCurrentChange(prev); diffViewRef.current?.scrollToChange(prev)
  }, [currentChange, totalChanges])

  const handleSave = async () => {
    if (!session || !diffs) return
    setSaveStatus('saving'); setShowSaveDialog(false)
    const { error } = await supabase.from('comparisons').insert({
      user_id: session.user.id,
      title: saveTitle || `Comparison ${new Date().toLocaleDateString('en-GB')}`,
      file_a: leftFile || 'Document A', file_b: rightFile || 'Document B',
      text_a: leftText, text_b: rightText, similarity: stats?.similarity ?? 0,
    })
    setSaveStatus(error ? 'error' : 'saved')
    setTimeout(() => setSaveStatus(null), 3000)
  }

  const handleLoad = (comparison) => {
    setLeftText(comparison.text_a || ''); setRightText(comparison.text_b || '')
    setLeftFile(comparison.file_a || ''); setRightFile(comparison.file_b || '')
    setSaveTitle(comparison.title || '')
    const result = computeDiff(comparison.text_a || '', comparison.text_b || '')
    setDiffs(result); setHasRun(true); setCurrentChange(0); setSaveStatus('saved')
  }

  const handleExport = useCallback(() => {
    if (!diffs) return
    const html = exportDiffHTML(diffs, leftFile || 'Original', rightFile || 'Revised')
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'diffdoc-report.html'; a.click()
    URL.revokeObjectURL(url)
  }, [diffs, leftFile, rightFile])

  const handleReset = () => {
    setLeftText(''); setRightText(''); setLeftFile(''); setRightFile('')
    setDiffs(null); setHasRun(false); setCurrentChange(0)
    setSaveStatus(null); setSaveTitle(''); setShowSaveDialog(false)
    setMobilePane('left')
  }

  const canCompare = leftText.trim().length > 0 || rightText.trim().length > 0

  if (authLoading) return (
    <div style={{ minHeight: '100dvh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ width: 16, height: 16, border: '1.5px solid var(--border)', borderTopColor: 'var(--ring)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  if (!session) return <AuthPage />

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
        animation: 'fade-up 0.3s var(--ease-out) both'
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 1rem',
          height: isMobile ? 48 : 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M16 3L4 8v8c0 6.627 5.152 11.95 12 13 6.848-1.05 12-6.373 12-13V8L16 3z"
                fill="var(--secondary)" stroke="var(--border)" strokeWidth="1.5"/>
              <path d="M11 16.5l3.5 3.5 6.5-7" stroke="var(--primary)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{ fontSize: isMobile ? '0.875rem' : '0.9375rem', fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--foreground)', lineHeight: 1.2 }}>DiffDoc</div>
              {!isMobile && <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', lineHeight: 1 }}>Visual Document Comparison</div>}
            </div>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
            {hasRun && !isMobile && (
              <ChangeNavigator current={currentChange} total={totalChanges} onPrev={handlePrev} onNext={handleNext} />
            )}

            {hasRun && (
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {(isMobile ? ['inline', 'side-by-side'] : ['side-by-side', 'inline']).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{
                    padding: '0 0.6rem', height: '2.25rem',
                    background: view === v ? 'var(--primary)' : 'transparent',
                    color: view === v ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                    border: 'none', fontFamily: 'var(--font-sans)',
                    fontSize: isMobile ? '0.7rem' : '0.75rem', fontWeight: 500, cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}>
                    {v === 'side-by-side' ? (isMobile ? '⊟' : 'Side by side') : (isMobile ? '☰' : 'Inline')}
                  </button>
                ))}
              </div>
            )}

            {hasRun && (
              <button onClick={() => setShowSaveDialog(true)} disabled={saveStatus === 'saving'}
                style={{
                  ...S.btn(saveStatus === 'saved' ? 'ghost' : 'primary'),
                  ...(saveStatus === 'saved' ? { background: 'rgba(74,222,128,.12)', color: '#86efac', borderColor: 'rgba(74,222,128,.2)' } : {}),
                  ...(saveStatus === 'error' ? { background: 'rgba(248,113,113,.12)', color: '#fca5a5', borderColor: 'rgba(248,113,113,.2)' } : {}),
                  opacity: saveStatus === 'saving' ? 0.6 : 1,
                  padding: isMobile ? '0 0.6rem' : '0 0.875rem',
                }}>
                {saveStatus === 'saving' ? '…' : saveStatus === 'saved' ? '✓' : saveStatus === 'error' ? '⚠' : isMobile ? '↑' : '↑ Save'}
              </button>
            )}

            {hasRun && !isMobile && (
              <button onClick={handleExport} style={S.btn()}>↓ Export</button>
            )}

            <SavedComparisons onLoad={handleLoad} isMobile={isMobile} />

            {hasRun && (
              <button onClick={handleReset} style={{ ...S.btn(), padding: isMobile ? '0 0.6rem' : '0 0.875rem' }}>
                {isMobile ? '↺' : '↺ Reset'}
              </button>
            )}

            <ThemeToggle />

            {/* User avatar + sign out */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', paddingLeft: '0.375rem', borderLeft: '1px solid var(--border)' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', background: 'var(--secondary)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--foreground)',
                flexShrink: 0
              }}>
                {session.user.email[0].toUpperCase()}
              </div>
              {!isMobile && (
                <button onClick={() => supabase.auth.signOut()} style={{
                  background: 'none', border: 'none', fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem', color: 'var(--muted-foreground)', cursor: 'pointer',
                }}>Sign out</button>
              )}
            </div>
          </div>
        </div>

        {/* ── MOBILE: change navigator bar ── */}
        {hasRun && isMobile && totalChanges > 0 && (
          <div style={{
            borderTop: '1px solid var(--border)', padding: '0.5rem 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
            background: 'var(--card)'
          }}>
            <ChangeNavigator current={currentChange} total={totalChanges} onPrev={handlePrev} onNext={handleNext} />
            <button onClick={handleExport} style={{ ...S.btn(), fontSize: '0.75rem' }}>↓ Export</button>
          </div>
        )}
      </header>

      {/* ── SAVE DIALOG ── */}
      {showSaveDialog && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: isMobile ? '0' : '1rem',
        }} onClick={() => setShowSaveDialog(false)}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: isMobile ? 'var(--radius-xl) var(--radius-xl) 0 0' : 'var(--radius-xl)',
            padding: '1.5rem', width: '100%', maxWidth: isMobile ? '100%' : 360,
            animation: 'fade-up 0.2s var(--ease-out) both',
            paddingBottom: isMobile ? 'calc(1.5rem + env(safe-area-inset-bottom))' : '1.5rem',
          }} onClick={e => e.stopPropagation()}>
            {/* Drag handle on mobile */}
            {isMobile && <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 1.25rem' }} />}
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem' }}>Save comparison</div>
            <input type="text" placeholder="Give this comparison a name…" value={saveTitle}
              onChange={e => setSaveTitle(e.target.value)} autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              style={{
                width: '100%', height: '2.75rem', padding: '0 0.875rem',
                background: 'var(--secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)',
                fontSize: '1rem', color: 'var(--foreground)', outline: 'none', marginBottom: '1rem'
              }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setShowSaveDialog(false)} style={{ ...S.btn(), flex: 1, height: '2.75rem' }}>Cancel</button>
              <button onClick={handleSave} style={{ ...S.btn('primary'), flex: 1, height: '2.75rem' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── INPUT PHASE ── */}
      {!hasRun && (
        <main style={{
          flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto',
          padding: isMobile ? '0.75rem' : '1.25rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: isMobile ? '0.75rem' : '1rem'
        }}>

          {/* Mobile tab switcher for panes */}
          {isMobile && (
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {[['left', 'Document A'], ['right', 'Document B']].map(([p, label]) => (
                <button key={p} onClick={() => setMobilePane(p)} style={{
                  flex: 1, height: '2.5rem', background: mobilePane === p ? 'var(--primary)' : 'transparent',
                  color: mobilePane === p ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  {label}
                  {p === 'left' && leftText && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac', flexShrink: 0 }} />}
                  {p === 'right' && rightText && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac', flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          )}

          {/* Panes — grid on desktop, single on mobile */}
          <div style={{
            display: isMobile ? 'block' : 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem', flex: 1
          }}>
            {isMobile ? (
              mobilePane === 'left'
                ? <DropZone label="Document A" step="01" side="left" value={leftText} onChange={setLeftText} fileName={leftFile} onFileNameChange={setLeftFile} isMobile={isMobile} />
                : <DropZone label="Document B" step="02" side="right" value={rightText} onChange={setRightText} fileName={rightFile} onFileNameChange={setRightFile} isMobile={isMobile} />
            ) : (
              <>
                <DropZone label="Document A" step="01" side="left" value={leftText} onChange={setLeftText} fileName={leftFile} onFileNameChange={setLeftFile} isMobile={false} />
                <DropZone label="Document B" step="02" side="right" value={rightText} onChange={setRightText} fileName={rightFile} onFileNameChange={setRightFile} isMobile={false} />
              </>
            )}
          </div>

          {/* Compare button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', paddingBottom: isMobile ? '0.5rem' : 0 }}>
            <button onClick={handleCompare} disabled={!canCompare} style={{
              ...S.btn('primary'),
              width: isMobile ? '100%' : 'auto',
              height: isMobile ? '3rem' : '2.5rem',
              padding: '0 2rem',
              opacity: canCompare ? 1 : 0.4,
              cursor: canCompare ? 'pointer' : 'not-allowed',
              fontSize: '0.9375rem',
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
                <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Compare documents
            </button>
            {!canCompare && (
              <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                {isMobile ? 'Add text to both Document A and B' : 'Paste text or drop files into both panes'}
              </span>
            )}
          </div>
        </main>
      )}

      {/* ── RESULTS PHASE ── */}
      {hasRun && diffs && (
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <DiffStats stats={stats} isMobile={isMobile} />
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {view === 'inline' || (isMobile && view !== 'side-by-side')
              ? <InlineView ref={diffViewRef} diffs={diffs} currentChange={currentChange} />
              : <SideBySide ref={diffViewRef} diffs={diffs}
                  leftLabel={leftFile || 'Document A'} rightLabel={rightFile || 'Document B'}
                  currentChange={currentChange} isMobile={isMobile} />
            }
          </div>
          <footer style={{
            borderTop: '1px solid var(--border)', padding: isMobile ? '0.75rem 1rem' : '0.5rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--card)', flexWrap: 'wrap', gap: '0.5rem',
            paddingBottom: isMobile ? 'calc(0.75rem + env(safe-area-inset-bottom))' : undefined,
          }}>
            <button onClick={() => setHasRun(false)} style={{
              background: 'none', border: 'none', fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem', color: 'var(--muted-foreground)', cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}>← Edit documents</button>
            {isMobile && (
              <button onClick={() => supabase.auth.signOut()} style={{
                background: 'none', border: 'none', fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem', color: 'var(--muted-foreground)', cursor: 'pointer',
              }}>Sign out</button>
            )}
            {!isMobile && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>Documents never leave your browser</span>}
          </footer>
        </main>
      )}
    </div>
  )
}
