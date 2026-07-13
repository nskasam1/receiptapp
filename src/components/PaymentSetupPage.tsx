import type { User } from '@supabase/supabase-js'
import { StepShell } from './StepShell'
import { PaymentMethodsPanel } from './ui/PaymentMethodsPanel'

export function PaymentSetupPage({ user, onBack }: { user: User; onBack: () => void }) {
  return (
    <StepShell title="Payment methods" onBack={onBack}>
      <div className="flex flex-col gap-6 pb-6 text-center">
        <div>
          <h2 className="mb-1.5 text-[21px] font-semibold">Get paid back</h2>
          <p className="mx-auto max-w-[32ch] text-[14px] text-muted">
            Tap the apps you use, add your handle, and links to pay you show up automatically on the Share step.
          </p>
        </div>

        <PaymentMethodsPanel user={user} />
      </div>
    </StepShell>
  )
}
