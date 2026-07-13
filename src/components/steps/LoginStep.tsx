import { useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { isSupabaseConfigured } from '../../lib/supabase/client'
import { useAuth } from '../../lib/supabase/useAuth'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { AuthForm } from '../ui/AuthForm'
import { PaymentMethodsPanel } from '../ui/PaymentMethodsPanel'
import { Icon } from '../ui/Icon'

export function LoginStep() {
  const nextStep = useReceiptStore((s) => s.nextStep)
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const [showAuthForm, setShowAuthForm] = useState(false)

  return (
    <StepShell
      title="SplitScan"
      bottomBar={
        <BottomBar primaryLabel={user ? 'Continue' : 'Continue as guest'} onPrimary={nextStep} variant="accent" />
      }
    >
      <div className="flex flex-col items-center py-6 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-hover">
          <Icon name="receipt" size={30} className="text-primary-ink/70" />
        </div>
        <h2 className="mb-1.5 text-[21px] font-semibold">Welcome</h2>
        <p className="mb-6 max-w-[30ch] text-[14px] text-muted">
          Sign in to save people and payment links across your devices — or skip it and go straight to scanning.
        </p>

        {!isSupabaseConfigured ? (
          <div className="w-full max-w-xs rounded-xl border border-border bg-surface p-4 text-[13px] text-muted">
            Sync isn't set up on this device yet — you can still use SplitScan as a guest.
          </div>
        ) : authLoading ? null : user ? (
          <div className="flex w-full max-w-xs flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span className="truncate text-[13px] text-muted">Signed in as {user.email}</span>
              <button type="button" onClick={signOut} className="shrink-0 text-[13px] font-medium text-primary">
                Sign out
              </button>
            </div>
            <PaymentMethodsPanel user={user} />
          </div>
        ) : showAuthForm ? (
          <div className="animate-rise flex w-full max-w-xs flex-col gap-2">
            <AuthForm onSignIn={signIn} onSignUp={signUp} />
            <button
              type="button"
              onClick={() => setShowAuthForm(false)}
              className="text-[13px] font-medium text-muted"
            >
              Never mind
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAuthForm(true)}
            className="w-full max-w-xs rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-primary-ink hover:bg-primary/90"
          >
            Log in or create account
          </button>
        )}
      </div>
    </StepShell>
  )
}
