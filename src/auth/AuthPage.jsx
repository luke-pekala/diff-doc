import React, { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const clear = () => { setMessage(null); setError(null) }

  const handleSubmit = async (e) => {
    e.preventDefault(); clear(); setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Account created! You can now sign in.')
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
      if (error) setError(error.message)
      else setMessage('Reset link sent — check your inbox.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--background)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 3L4 8v8c0 6.627 5.152 11.95 12 13 6.848-1.05 12-6.373 12-13V8L16 3z"
              fill="var(--secondary)" stroke="var(--border)" strokeWidth="1.5"/>
            <path d="M11 16.5l3.5 3.5 6.5-7" stroke="var(--primary)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--foreground)', lineHeight: 1.2 }}>DiffDoc</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', lineHeight: 1 }}>Visual Document Comparison</div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); clear() }} style={{
                flex: 1, padding: '0.75rem', background: 'none', border: 'none',
                borderBottom: `2px solid ${mode === m ? 'var(--primary)' : 'transparent'}`,
                marginBottom: '-1px', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem',
                fontWeight: 500, color: mode === m ? 'var(--foreground)' : 'var(--muted-foreground)',
                cursor: 'pointer', transition: 'color var(--dur-fast) var(--ease-out)'
              }}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <div style={{ padding: '1.5rem' }}>
            {mode === 'reset' && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Enter your email and we'll send a reset link.
              </p>
            )}

            {error && (
              <div style={{
                padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)',
                color: '#fca5a5', fontSize: '0.8125rem', marginBottom: '1rem', lineHeight: 1.5
              }}>⚠ {error}</div>
            )}
            {message && (
              <div style={{
                padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.2)',
                color: '#86efac', fontSize: '0.8125rem', marginBottom: '1rem', lineHeight: 1.5
              }}>✓ {message}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Email', type: 'email', val: email, set: setEmail, ph: 'you@company.com' },
                ...(mode !== 'reset' ? [{ label: 'Password', type: 'password', val: password, set: setPassword, ph: 'Min. 8 characters' }] : [])
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--foreground)' }}>{f.label}</label>
                  <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                    placeholder={f.ph} required minLength={f.type === 'password' ? 8 : undefined}
                    style={{
                      height: '2.25rem', padding: '0 0.75rem', background: 'var(--secondary)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                      color: 'var(--foreground)', outline: 'none', width: '100%',
                      transition: 'border-color var(--dur-fast) var(--ease-out)'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--ring)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              ))}

              <button type="submit" disabled={loading} style={{
                height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--primary)',
                color: 'var(--primary-foreground)', border: 'none', fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1, transition: 'opacity var(--dur-fast) var(--ease-out)',
                marginTop: '0.25rem'
              }}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
              </button>
            </form>

            {mode === 'login' && (
              <button onClick={() => { setMode('reset'); clear() }} style={{
                display: 'block', marginTop: '1rem', width: '100%', background: 'none', border: 'none',
                fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)',
                cursor: 'pointer', textAlign: 'center'
              }}>Forgot password?</button>
            )}
            {mode === 'reset' && (
              <button onClick={() => { setMode('login'); clear() }} style={{
                display: 'block', marginTop: '1rem', width: '100%', background: 'none', border: 'none',
                fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)',
                cursor: 'pointer', textAlign: 'center'
              }}>← Back to sign in</button>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.6875rem', color: 'var(--muted-foreground)', opacity: 0.6 }}>
          🔒 Documents never leave your browser
        </p>
      </div>
    </div>
  )
}
