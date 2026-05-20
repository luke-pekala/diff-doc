import React, { useState, useRef, useCallback } from 'react'
import { extractTextFromPDF } from '../utils/pdfExtract'
import { extractTextFromDOCX } from '../utils/docxExtract'

function getFileType(file) {
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return 'pdf'
  if (file.name.endsWith('.docx') || file.name.endsWith('.doc') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx'
  if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) return 'text'
  return 'unknown'
}

export default function DropZone({ label, step, side, value, onChange, fileName, onFileNameChange, isMobile }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const processFile = useCallback(async (file) => {
    if (!file) return
    setError(null)
    const type = getFileType(file)
    if (type === 'pdf') {
      setLoading(true); setLoadingMsg('Extracting from PDF…')
      try { onChange(await extractTextFromPDF(file)); onFileNameChange(file.name) }
      catch { setError('Could not extract PDF. Is it a scanned image?') }
      finally { setLoading(false) }
    } else if (type === 'docx') {
      setLoading(true); setLoadingMsg('Extracting from Word document…')
      try { onChange(await extractTextFromDOCX(file)); onFileNameChange(file.name) }
      catch { setError('Could not extract Word document.') }
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
    e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0])
  }, [processFile])

  // When user taps the empty state hint, focus the textarea so keyboard appears
  const handleEmptyTap = () => {
    textareaRef.current?.focus()
  }

  const minHeight = isMobile ? 260 : 320

  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid ${dragging ? 'var(--ring)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-xl)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', minHeight,
      outline: dragging ? '1px dashed var(--ring)' : 'none', outlineOffset: -3,
      animation: 'fade-up 0.35s var(--ease-out) both'
    }}
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
        padding: isMobile ? '0.625rem 0.875rem' : '0.625rem 1rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--muted-foreground)',
            background: 'var(--secondary)', padding: '0.1em 0.4em',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', flexShrink: 0
          }}>{step}</span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)', flexShrink: 0 }}>{label}</span>
          {fileName && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)',
              background: 'var(--secondary)', padding: '0.1em 0.45em',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              overflow: 'hidden', maxWidth: isMobile ? 120 : 160
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
              <button onClick={() => { onChange(''); onFileNameChange('') }} style={{
                background: 'none', border: 'none', color: 'var(--muted-foreground)',
                cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
              }}>×</button>
            </span>
          )}
        </div>
        <button onClick={() => fileInputRef.current?.click()} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
          height: isMobile ? '2rem' : '1.75rem', padding: isMobile ? '0 0.75rem' : '0 0.6rem',
          borderRadius: 'var(--radius-md)', background: 'var(--secondary)',
          border: '1px solid var(--border)', fontFamily: 'var(--font-sans)',
          fontSize: isMobile ? '0.8125rem' : '0.75rem', fontWeight: 500,
          color: 'var(--muted-foreground)', cursor: 'pointer', flexShrink: 0,
          WebkitTapHighlightColor: 'transparent',
        }}>
          + Upload
        </button>
        <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.md"
          style={{ display: 'none' }} onChange={e => processFile(e.target.files[0])} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: isMobile ? 200 : 240 }}>

        {loading ? (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            color: 'var(--muted-foreground)', background: 'var(--card)', zIndex: 2
          }}>
            <span style={{ width: 14, height: 14, border: '1.5px solid var(--border)', borderTopColor: 'var(--ring)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{loadingMsg}</span>
          </div>
        ) : null}

        {/* ── Always-rendered textarea ── */}
        {/* This is the key fix: textarea is always present so paste always works */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          spellCheck={false}
          placeholder=" "
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            padding: isMobile ? '0.875rem' : '1rem',
            background: 'transparent', border: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: isMobile ? '0.9375rem' : '0.875rem',
            lineHeight: 1.7, color: 'var(--foreground)',
            resize: 'none', outline: 'none',
            zIndex: 1,
            // Make sure it's always interactive
            pointerEvents: loading ? 'none' : 'all',
          }}
        />

        {/* ── Empty state hint — shown on top when no value ── */}
        {!value && !loading && (
          <div
            onClick={handleEmptyTap}
            style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.625rem', padding: '2rem', textAlign: 'center',
              pointerEvents: 'none', // let clicks pass through to textarea
              zIndex: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }}>
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3"/>
              <line x1="10" y1="6" x2="10" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="10" cy="13" r="0.6" fill="currentColor"/>
            </svg>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
              {isMobile ? 'Tap to paste or use Upload' : 'Paste text or drag & drop a file'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)', opacity: 0.6 }}>
              PDF · DOCX · TXT · MD
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '0.5rem 1rem', background: 'rgba(248,113,113,.08)',
          borderTop: '1px solid rgba(248,113,113,.15)',
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#fca5a5'
        }}>⚠ {error}</div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0.5rem 0.875rem' : '0.4rem 1rem',
        borderTop: '1px solid var(--border)'
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
          {value.length.toLocaleString()} chars
        </span>
        {value && (
          <button onClick={() => { onChange(''); onFileNameChange('') }} style={{
            background: 'none', border: 'none', fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem', color: 'var(--muted-foreground)', cursor: 'pointer',
            padding: '0.25rem 0.5rem', WebkitTapHighlightColor: 'transparent',
          }}>Clear</button>
        )}
      </div>
    </div>
  )
}
