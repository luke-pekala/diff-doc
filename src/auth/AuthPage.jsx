import React, { useState } from 'react'
import { supabase } from '../utils/supabase'
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const clear = () => { setMessage(null); setError(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clear()
    setLoading(true)

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">DiffDoc</h1>
            <p className="text-xs text-muted-foreground">Visual Document Comparison</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-card shadow-sm p-6">

          {/* Tabs */}
          <div className="flex border-b mb-6">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); clear() }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  mode === m
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {mode === 'reset' && (
            <p className="text-sm text-muted-foreground mb-4">
              Enter your email and we'll send you a reset link.
            </p>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-sm mb-4">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Please wait…'
                : mode === 'login' ? 'Sign in'
                : mode === 'signup' ? 'Create account'
                : 'Send reset link'}
            </button>
          </form>

          {mode === 'login' && (
            <button
              onClick={() => { setMode('reset'); clear() }}
              className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </button>
          )}

          {mode === 'reset' && (
            <button
              onClick={() => { setMode('login'); clear() }}
              className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to sign in
            </button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          🔒 Your documents never leave your browser
        </p>
      </div>
    </div>
  )
}
