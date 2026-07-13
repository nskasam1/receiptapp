import { useEffect, useMemo, useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { computeSplit, computeTipCents } from '../../lib/split'
import { buildGroupSummaryText, buildItemizedText, buildShortText, shareText } from '../../lib/share'
import { buildPaymentLink, PAYMENT_PROVIDERS } from '../../lib/payments'
import { useAuth } from '../../lib/supabase/useAuth'
import { fetchPaymentHandles, type PaymentHandle } from '../../lib/supabase/paymentHandles'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { PersonAvatar } from '../ui/PersonAvatar'
import { BrandIcon } from '../ui/BrandIcon'
import { Icon } from '../ui/Icon'
import { Toggle } from '../ui/Toggle'
import { Toast } from '../ui/Toast'

export function ShareStep() {
  const people = useReceiptStore((s) => s.people)
  const items = useReceiptStore((s) => s.items)
  const taxCents = useReceiptStore((s) => s.taxCents)
  const tipMode = useReceiptStore((s) => s.tipMode)
  const tipValue = useReceiptStore((s) => s.tipValue)
  const tipBasis = useReceiptStore((s) => s.tipBasis)
  const splitBasis = useReceiptStore((s) => s.splitBasis)
  const enteredGrandTotalCents = useReceiptStore((s) => s.enteredGrandTotalCents)
  const prevStep = useReceiptStore((s) => s.prevStep)
  const reset = useReceiptStore((s) => s.reset)

  const [format, setFormat] = useState<'itemized' | 'short'>('itemized')
  const [toast, setToast] = useState<string | null>(null)

  const { user } = useAuth()
  const [paymentHandles, setPaymentHandles] = useState<PaymentHandle[]>([])

  useEffect(() => {
    if (!user) {
      setPaymentHandles([])
      return
    }
    fetchPaymentHandles(user.id).then(setPaymentHandles)
  }, [user])

  const result = useMemo(() => {
    const subtotalCents = items.reduce((sum, i) => sum + i.totalPriceCents, 0)
    const tipCents = computeTipCents(tipMode, tipValue, tipBasis, subtotalCents, taxCents)
    return computeSplit({ people, items, taxCents, tipCents, splitBasis, enteredGrandTotalCents })
  }, [people, items, taxCents, tipMode, tipValue, tipBasis, splitBasis, enteredGrandTotalCents])

  async function handleShare(text: string) {
    const outcome = await shareText(text)
    if (outcome === 'copied') setToast('Copied to clipboard')
    if (outcome === 'unavailable') setToast("Couldn't share — try copy instead")
  }

  async function handleCopyZelle(handle: string) {
    try {
      await navigator.clipboard.writeText(handle)
      setToast('Zelle info copied')
    } catch {
      setToast("Couldn't copy — try again")
    }
  }

  return (
    <StepShell
      title="Send it"
      stepIndex={6}
      stepCount={7}
      onBack={prevStep}
      bottomBar={
        <BottomBar
          primaryLabel="Share the breakdown"
          onPrimary={() => handleShare(buildGroupSummaryText(result.people, format === 'itemized'))}
          variant="accent"
          secondary={
            <button type="button" onClick={reset} className="px-2 text-[13px] font-medium text-primary">
              Start over
            </button>
          }
        />
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] text-muted">Message format</span>
        <Toggle
          value={format}
          onChange={setFormat}
          options={[
            { value: 'itemized', label: 'Itemized' },
            { value: 'short', label: 'Short' },
          ]}
        />
      </div>

      <ul className="flex flex-col gap-2.5">
        {result.people.map((split) => {
          const text = format === 'itemized' ? buildItemizedText(split) : buildShortText(split)
          return (
            <li
              key={split.personId}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5"
            >
              <PersonAvatar name={split.name} size={32} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-medium">{split.name}</div>
                <div className="truncate text-[13px] text-muted">{text}</div>
              </div>
              <button
                type="button"
                onClick={() => handleShare(text)}
                aria-label={`Share amount owed to ${split.name}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-ink"
              >
                <Icon name="share" size={17} />
              </button>
            </li>
          )
        })}
      </ul>

      {paymentHandles.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-[13px] font-medium text-muted">Pay me via</div>
          <div className="flex flex-col gap-2">
            {PAYMENT_PROVIDERS.map((p) => {
              const saved = paymentHandles.find((h) => h.provider === p.id)
              if (!saved) return null
              const link = buildPaymentLink(p.id, saved.handle)
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3"
                >
                  <BrandIcon provider={p.id} size={18} className="shrink-0 text-ink" />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{p.label}</span>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-[13px] font-semibold text-primary"
                    >
                      Open link
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCopyZelle(saved.handle)}
                      className="shrink-0 truncate text-[13px] font-semibold text-primary"
                    >
                      {saved.handle}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </StepShell>
  )
}
