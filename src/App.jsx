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
import { FileText, Download, RotateCcw, Save, LogOut, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from './lib/utils'

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

  const diffViewRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = () => supabase.auth.signOut()

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
      file_a: leftFile || 'Document A',
      file_b: rightFile || 'Document B',
      text_a: leftText,
      text_b: rightText,
      similarity: stats?.similarity ?? 0,
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
    const a = document.createElement('a')
    a.href = url; a.download = 'diffdoc-report.html'; a.click()
    URL.revokeObjectURL(url)
  }, [diffs, leftFile, rightFile])

  const handleReset = () => {
    setLeftText(''); setRightText(''); setLeftFile(''); setRightFile('')
    setDiffs(null); setHasRun(false); setCurrentChange(0)
    setSaveStatus(null); setSaveTitle(''); setShowSaveDialog(false)
  }

  const canCompare = leftText.trim().length > 0 || rightText.trim().length > 0

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!session) return <AuthPage />

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">

      {/* Header */}
      <header className="flex items-center justify-between px-5 h-14 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight">DiffDoc</span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">Visual Document Comparison</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasRun && <ChangeNavigator current={currentChange} total={totalChanges} onPrev={handlePrev} onNext={handleNext} />}

          {hasRun && (
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              {['side-by-side', 'inline'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn('px-3 h-8 text-xs font-medium transition-colors',
                    view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'
                  )}>
                  {v === 'side-by-side' ? 'Side by side' : 'Inline'}
                </button>
              ))}
            </div>
          )}

          {hasRun && (
            <button onClick={() => setShowSaveDialog(true)} disabled={saveStatus === 'saving'}
              className={cn('flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors border',
                saveStatus === 'saved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : saveStatus === 'error' ? 'bg-destructive/10 text-destructive border-destructive/20'
                  : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
              )}>
              {saveStatus === 'saving' ? <><div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />Saving…</>
                : saveStatus === 'saved' ? <><CheckCircle2 className="w-3.5 h-3.5" />Saved</>
                : saveStatus === 'error' ? <><AlertCircle className="w-3.5 h-3.5" />Error</>
                : <><Save className="w-3.5 h-3.5" />Save</>}
            </button>
          )}

          {hasRun && (
            <button onClick={handleExport}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-border hover:bg-accent transition-colors">
              <Download className="w-3.5 h-3.5" />Export
            </button>
          )}

          <SavedComparisons onLoad={handleLoad} />

          {hasRun && (
            <button onClick={handleReset}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-border hover:bg-accent transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />Reset
            </button>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">{session.user.email[0].toUpperCase()}</span>
            </div>
            <button onClick={handleSignOut}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowSaveDialog(false)}>
          <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-fade-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold mb-4">Save comparison</h3>
            <input
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring mb-4"
              type="text"
              placeholder="Give this comparison a name…"
              value={saveTitle}
              onChange={e => setSaveTitle(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSaveDialog(false)}
                className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
                Cancel
              </button>
              <button onClick={handleSave}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Phase */}
      {!hasRun && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-up">
          <div className="flex-1 grid grid-cols-2 min-h-0 overflow-hidden border-t border-border">
            <DropZone label="Document A — Original" side="left" value={leftText} onChange={setLeftText} fileName={leftFile} onFileNameChange={setLeftFile} />
            <DropZone label="Document B — Revised" side="right" value={rightText} onChange={setRightText} fileName={rightFile} onFileNameChange={setRightFile} />
          </div>
          <div className="flex items-center justify-center gap-4 py-4 px-6 border-t border-border bg-card flex-shrink-0">
            <button
              onClick={handleCompare}
              disabled={!canCompare}
              className={cn('h-10 px-8 rounded-lg text-sm font-semibold transition-all',
                canCompare
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}>
              Compare documents →
            </button>
            {!canCompare && <span className="text-sm text-muted-foreground">Add text or drop files into both panes above</span>}
          </div>
        </div>
      )}

      {/* Results Phase */}
      {hasRun && diffs && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-up">
          <DiffStats stats={stats} />
          <div className="flex-1 min-h-0 overflow-hidden">
            {view === 'inline'
              ? <InlineView ref={diffViewRef} diffs={diffs} currentChange={currentChange} />
              : <SideBySide ref={diffViewRef} diffs={diffs} leftLabel={leftFile || 'Original'} rightLabel={rightFile || 'Revised'} currentChange={currentChange} />
            }
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 border-t border-border bg-card flex-shrink-0">
            <button onClick={() => setHasRun(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Edit documents
            </button>
            <span className="text-xs text-muted-foreground">Modify and re-compare</span>
          </div>
        </div>
      )}
    </div>
  )
}
