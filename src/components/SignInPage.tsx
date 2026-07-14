import type { AuthResult } from '../lib/supabase/useAuth'
import { StepShell } from './StepShell'
import { AuthForm } from './ui/AuthForm'

export function SignInPage({
  onSignIn,
  onSignUp,
  onBack,
}: {
  onSignIn: (email: string, password: string) => Promise<AuthResult>
  onSignUp: (email: string, password: string) => Promise<AuthResult>
  onBack: () => void
}) {
  return (
    <StepShell title="Sign in" onBack={onBack}>
      <div className="flex flex-col gap-6 pb-6 text-center">
        <div>
          <h2 className="mb-1.5 text-[21px] font-semibold">Welcome back</h2>
          <p className="mx-auto max-w-[30ch] text-[14px] text-muted">
            Sign in or create an account to save people and payment links across your devices.
          </p>
        </div>

        <AuthForm onSignIn={onSignIn} onSignUp={onSignUp} />
      </div>
    </StepShell>
  )
}
