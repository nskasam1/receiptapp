import { useEffect, useMemo, useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { computeSplit, computeTipCents } from '../../lib/split'
import { buildGroupSummaryText, buildItemizedText, buildShortText, shareText } from '../../lib/share'
import { buildPaymentLink, PAYMENT_PROVIDERS, ZELLE_WEBSITE_URL } from '../../lib/payments'
import { useAuth } from '../../lib/supabase/useAuth'
import { fetchPaymentHandles, type PaymentHandle } from '../../lib/supabase/paymentHandles'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { PersonAvatar } from '../ui/PersonAvatar'
import { PersonChip } from '../ui/Chip'
import { BrandIcon } from '../ui/BrandIcon'
import { Icon } from '../ui/Icon'
import { Toggle } from '../ui/Toggle'
import { Toast } from '../ui/Toast'

export function ShareStep() {
  const people = useReceiptStore((s) => s.people)
  const items = useReceiptStore((s) => s.items)
  const taxCents = useReceiptStore((s) => s.taxCents)
  const feeCents = useReceiptStore((s) => s.feeCents)
  const tipMode = useReceiptStore((s) => s.tipMode)
  const tipValue = useReceiptStore((s) => s.tipValue)
  const tipBasis = useReceiptStore((s) => s.tipBasis)
  const splitBasis = useReceiptStore((s) => s.splitBasis)
  const enteredGrandTotalCents = useReceiptStore((s) => s.enteredGrandTotalCents)
  const payerId = useReceiptStore((s) => s.payerId)
  const setPayerId = useReceiptStore((s) => s.setPayerId)
  const prevStep = useReceiptStore((s) => s.prevStep)
  const reset = useReceiptStore((s) => s.reset)

  const [format, setFormat] = useState<'itemized' | 'short'>('short')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (payerId !== null) return
    const me = people.find((p) => p.name === 'ME')
    if (me) setPayerId(me.id)
  }, [people, payerId, setPayerId])

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
    return computeSplit({ people, items, taxCents, tipCents, feeCents, splitBasis, enteredGrandTotalCents })
  }, [people, items, taxCents, feeCents, tipMode, tipValue, tipBasis, splitBasis, enteredGrandTotalCents])

  const payer = people.find((p) => p.id === payerId) ?? null
  const owingPeople =
    payerId && people.length > 1 ? result.people.filter((split) => split.personId !== payerId) : result.people

  // The saved Venmo/Zelle/etc. handles belong to this account — only relevant
  // to share when this account is the one who actually paid (or nobody's been
  // denoted yet). If someone else paid, sharing "my" payment info would be
  // misleading, so it's left out entirely.
  const payerIsMe = !payer || payer.name === 'ME'
  const displayName =
    typeof user?.user_metadata?.display_name === 'string' ? user.user_metadata.display_name.trim() : ''

  // "ME" only makes sense as a label inside this device's own UI. Once someone
  // else is denoted as the payer, any row still showing "ME" is being read by
  // other people, so it needs to become an actual name.
  function resolveDisplayName(rawName: string): string {
    if (rawName !== 'ME' || payerIsMe) return rawName
    return displayName || 'Me'
  }
  const displayOwingPeople = owingPeople.map((split) => ({ ...split, name: resolveDisplayName(split.name) }))

  function buildPaymentLinesText(): string {
    const lines = PAYMENT_PROVIDERS.map((p) => {
      const saved = paymentHandles.find((h) => h.provider === p.id)
      if (!saved) return null
      const link = buildPaymentLink(p.id, saved.handle)
      if (link) return `${p.label}: ${link}`
      if (p.id === 'zelle') return `Zelle: ${saved.handle} (open Zelle: ${ZELLE_WEBSITE_URL})`
      return `${p.label}: ${saved.handle}`
    }).filter((line): line is string => line !== null)
    return lines.join('\n')
  }

  function withPaymentLinks(text: string): string {
    if (!payerIsMe) return text
    const paymentLines = buildPaymentLinesText()
    return paymentLines ? `${text}\n\nPay me via:\n${paymentLines}` : text
  }

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
          onPrimary={() =>
            handleShare(withPaymentLinks(buildGroupSummaryText(displayOwingPeople, format === 'itemized')))
          }
          variant="accent"
          secondary={
            <button type="button" onClick={reset} className="px-2 text-[13px] font-medium text-primary">
              Start over
            </button>
          }
        />
      }
    >
      {people.length > 1 && (
        <div className="mb-4">
          <div className="mb-2 text-[13px] text-muted">Who paid?</div>
          <div className="flex flex-wrap gap-2">
            {people.map((p) => (
              <PersonChip
                key={p.id}
                name={p.name === 'ME' ? 'ME' : p.name}
                selected={p.id === payerId}
                onToggle={() => setPayerId(p.id === payerId ? null : p.id)}
              />
            ))}
          </div>
          {payer && (
            <p className="mt-2 text-[12px] text-muted">
              Showing what everyone else owes {payer.name === 'ME' ? 'you' : payer.name}.
            </p>
          )}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] text-muted">Message format</span>
        <Toggle
          value={format}
          onChange={setFormat}
          options={[
            { value: 'short', label: 'Short' },
            { value: 'itemized', label: 'Itemized' },
          ]}
        />
      </div>

      <ul className="flex flex-col gap-2.5">
        {displayOwingPeople.map((split) => {
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
                onClick={() => handleShare(withPaymentLinks(text))}
                aria-label={`Share amount owed to ${split.name}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-ink"
              >
                <Icon name="share" size={17} />
              </button>
            </li>
          )
        })}
      </ul>

      {payerIsMe && paymentHandles.length > 0 && (
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
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleCopyZelle(saved.handle)}
                        className="truncate text-[13px] font-semibold text-primary"
                      >
                        {saved.handle}
                      </button>
                      <a
                        href={ZELLE_WEBSITE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] font-semibold text-primary"
                      >
                        Open Zelle
                      </a>
                    </div>
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
