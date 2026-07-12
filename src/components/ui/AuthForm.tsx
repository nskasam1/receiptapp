import { useState } from 'react'
import type { AuthResult } from '../../lib/supabase/useAuth'

export function AuthForm({
  onSignIn,
  onSignUp,
}: {
  onSignIn: (email: string, password: string) => Promise<AuthResult>
  onSignUp: (email: string, password: string) => Promise<AuthResult>
}) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    const result = mode === 'sign-in' ? await onSignIn(email, password) : await onSignUp(email, password)
    setSubmitting(false)
    if (!result.ok) {
      setMessage({ text: result.message ?? 'Something went wrong', isError: true })
      return
    }
    if (result.message) setMessage({ text: result.message, isError: false })
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="mb-3 text-[13px] font-medium text-ink">Remember people across your devices</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-muted focus:border-primary"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-muted focus:border-primary"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary py-2 text-[14px] font-semibold text-primary-ink disabled:opacity-50"
        >
          {mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      {message && (
        <p className={`mt-2 text-[13px] ${message.isError ? 'text-accent-text' : 'text-primary'}`}>{message.text}</p>
      )}

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
          setMessage(null)
        }}
        className="mt-2 text-[13px] font-medium text-primary"
      >
        {mode === 'sign-in' ? "New here? Create an account" : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}
