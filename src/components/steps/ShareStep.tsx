import { useMemo, useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { computeSplit, computeTipCents } from '../../lib/split'
import { buildGroupSummaryText, buildItemizedText, buildShortText, shareText } from '../../lib/share'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { PersonAvatar } from '../ui/PersonAvatar'
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

  return (
    <StepShell
      title="Send it"
      stepIndex={6}
      stepCount={7}
      onBack={prevStep}
      bottomBar={
        <BottomBar
          primaryLabel="Start a new split"
          onPrimary={reset}
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
        {result.people.map((split, index) => {
          const text = format === 'itemized' ? buildItemizedText(split) : buildShortText(split)
          return (
            <li key={split.personId} className="rounded-xl bg-surface p-3.5">
              <div className="flex items-center gap-3">
                <PersonAvatar name={split.name} index={index} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-medium">{split.name}</div>
                  <div className="truncate text-[13px] text-muted">{text}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleShare(text)}
                  aria-label={`Share amount owed to ${split.name}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-ink"
                >
                  <Icon name="share" size={17} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={() => handleShare(buildGroupSummaryText(result.people, format === 'itemized'))}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-[14px] font-medium text-ink hover:bg-surface"
      >
        <Icon name="message" size={16} />
        Share the whole breakdown at once
      </button>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </StepShell>
  )
}
