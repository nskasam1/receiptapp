import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './client'

export interface AuthResult {
  ok: boolean
  message?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string): Promise<AuthResult> {
    if (!supabase) return { ok: false, message: 'Sync is not configured yet' }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) return { ok: false, message: error.message }
    if (!data.session) {
      return { ok: true, message: 'Check your email to confirm your account, then sign in.' }
    }
    return { ok: true }
  }

  async function signIn(email: string, password: string): Promise<AuthResult> {
    if (!supabase) return { ok: false, message: 'Sync is not configured yet' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  }

  async function signOut(): Promise<void> {
    await supabase?.auth.signOut()
  }

  return { user, loading, signUp, signIn, signOut }
}
