import React, { useState, useRef, useCallback } from 'react'
import { extractTextFromPDF } from '../utils/pdfExtract'
import { extractTextFromDOCX } from '../utils/docxExtract'
import { Upload, X, FileText } from 'lucide-react'
import { cn } from '../lib/utils'

function getFileType(file) {
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return 'pdf'
  if (file.name.endsWith('.docx') || file.name.endsWith('.doc') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx'
  if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) return 'text'
  return 'unknown'
}

export default function DropZone({ label, side, value, onChange, fileName, onFileNameChange }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const processFile = useCallback(async (file) => {
    if (!file) return
    setError(null)
    const type = getFileType(file)

    if (type === 'pdf') {
      setLoading(true); setLoadingMsg('Extracting text from PDF…')
      try {
        onChange(await extractTextFromPDF(file))
        onFileNameChange(file.name)
      } catch { setError('Could not extract PDF text. Is it a scanned image?') }
      finally { setLoading(false) }
    } else if (type === 'docx') {
      setLoading(true); setLoadingMsg('Extracting text from Word document…')
      try {
        onChange(await extractTextFromDOCX(file))
        onFileNameChange(file.name)
      } catch { setError('Could not extract Word document text.') }
      finally { setLoading(false) }
    } else if (type === 'text') {
      const reader = new FileReader()
      reader.onload = e => { onChange(e.target.result); onFileNameChange(file.name) }
      reader.readAsText(file)
    } else {
      setError('Unsupported file. Use PDF, DOCX, TXT, or MD.')
    }
  }, [onChange, onFileNameChange])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    processFile(e.dataTransfer.files[0])
  }, [processFile])

  const accentClass = side === 'left' ? 'text-violet-600' : 'text-emerald-600'
  const borderAccent = side === 'left' ? 'border-l-violet-500' : 'border-l-emerald-500'

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className={cn('flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30 border-l-2', borderAccent)}>
        <span className={cn('text-xs font-semibold uppercase tracking-widest flex-1', accentClass)}>{label}</span>
        {fileName && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background border rounded-md px-2 py-0.5 max-w-[160px] truncate">
            <FileText className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{fileName}</span>
            <button onClick={() => { onChange(''); onFileNameChange('') }} className="flex-shrink-0 hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn('text-xs font-medium px-2.5 py-1 rounded-md border transition-colors', accentClass, 'border-current hover:bg-accent')}
        >
          + PDF / DOCX / TXT
        </button>
        <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.md" className="hidden" onChange={e => processFile(e.target.files[0])} />
      </div>

      {/* Body */}
      <div
        className={cn('relative flex-1 min-h-0 overflow-hidden', dragging && 'bg-accent/50')}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
            <span className="text-sm">{loadingMsg}</span>
          </div>
        ) : value ? (
          <textarea
            className="w-full h-full p-5 text-sm leading-relaxed bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground font-sans"
            value={value}
            onChange={e => onChange(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Drop a file here</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, Word (.docx), TXT, MD — or paste text directly</p>
            </div>
          </div>
        )}

        {dragging && (
          <div className={cn('absolute inset-2 border-2 border-dashed rounded-lg flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none', side === 'left' ? 'border-violet-400' : 'border-emerald-400')}>
            <span className={cn('text-sm font-medium', accentClass)}>Drop to load</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-xs text-destructive bg-destructive/10 border-t border-destructive/20">
          ⚠ {error}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground font-mono">
          {value.length.toLocaleString()} chars · {value.split('\n').length} lines
        </span>
        {value && (
          <button onClick={() => { onChange(''); onFileNameChange('') }} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
