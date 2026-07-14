import { useEffect, useMemo, useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { computeSplit, computeTipCents, formatCents } from '../../lib/split'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { PersonAvatar } from '../ui/PersonAvatar'
import { TornEdge } from '../ui/TornEdge'
import { Confetti } from '../ui/Confetti'
import { Icon } from '../ui/Icon'

export function SummaryStep() {
  const people = useReceiptStore((s) => s.people)
  const items = useReceiptStore((s) => s.items)
  const taxCents = useReceiptStore((s) => s.taxCents)
  const feeCents = useReceiptStore((s) => s.feeCents)
  const tipMode = useReceiptStore((s) => s.tipMode)
  const tipValue = useReceiptStore((s) => s.tipValue)
  const tipBasis = useReceiptStore((s) => s.tipBasis)
  const splitBasis = useReceiptStore((s) => s.splitBasis)
  const enteredGrandTotalCents = useReceiptStore((s) => s.enteredGrandTotalCents)
  const nextStep = useReceiptStore((s) => s.nextStep)
  const prevStep = useReceiptStore((s) => s.prevStep)

  const [showConfetti, setShowConfetti] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 900)
    return () => clearTimeout(timer)
  }, [])

  const result = useMemo(() => {
    const subtotalCents = items.reduce((sum, i) => sum + i.totalPriceCents, 0)
    const tipCents = computeTipCents(tipMode, tipValue, tipBasis, subtotalCents, taxCents)
    return computeSplit({ people, items, taxCents, tipCents, feeCents, splitBasis, enteredGrandTotalCents })
  }, [people, items, taxCents, feeCents, tipMode, tipValue, tipBasis, splitBasis, enteredGrandTotalCents])

  return (
    <StepShell
      title="The split"
      stepIndex={5}
      stepCount={7}
      onBack={prevStep}
      bottomBar={
        <BottomBar
          primaryLabel="Share"
          onPrimary={nextStep}
          info={
            <span className="text-[13px] text-muted">
              Group total{' '}
              <span className="font-mono-tabular font-semibold text-ink">
                {formatCents(result.computedGrandTotalCents)}
              </span>
            </span>
          }
        />
      }
    >
      {showConfetti && <Confetti />}

      {enteredGrandTotalCents !== null && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-border px-3.5 py-2.5 text-[13px] text-muted">
          <Icon name={result.reconciles ? 'check' : 'alert'} size={16} className={result.reconciles ? 'text-primary' : 'text-accent-text'} />
          {result.reconciles ? (
            <span>Matches the receipt's total.</span>
          ) : (
            <span className="text-accent-text">
              Off by {formatCents(Math.abs(result.differenceCents))} from the receipt's{' '}
              {formatCents(enteredGrandTotalCents)} total — worth a second look.
            </span>
          )}
        </div>
      )}

      {result.unassignedItemCount > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-border px-3.5 py-2.5 text-[13px] text-accent-text">
          <Icon name="alert" size={16} />
          {result.unassignedItemCount} item{result.unassignedItemCount === 1 ? '' : 's'} not assigned to
          anyone — left out of the split.
        </div>
      )}

      <div className="rounded-t-xl border border-b-0 border-border bg-surface px-4 py-4">
        <ul className="flex flex-col gap-4">
          {result.people.map((split, index) => (
            <li key={split.personId}>
              <div className="flex items-center gap-3">
                <PersonAvatar name={split.name} size={30} />
                <span className="min-w-0 flex-1 truncate text-[16px] font-medium">{split.name}</span>
                <span className="leader" />
                <span className="font-mono-tabular shrink-0 text-[17px] font-bold">
                  {formatCents(split.totalCents)}
                </span>
              </div>
              {split.items.length > 0 && (
                <div className="mt-2 flex flex-col gap-1 pl-[42px]">
                  {split.items.map((line, i) => (
                    <div key={i} className="flex items-baseline">
                      <span className="truncate text-[13px] text-muted">{line.name}</span>
                      <span className="leader" />
                      <span className="font-mono-tabular shrink-0 text-[13px] text-muted">
                        {formatCents(line.shareCents)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {index < result.people.length - 1 && <div className="mt-4 border-b border-border" />}
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-dashed border-accent-text" />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline">
            <span className="text-[13px] text-muted">Subtotal</span>
            <span className="leader" />
            <span className="font-mono-tabular text-[13px] text-muted">
              {formatCents(result.subtotalCents)}
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-[13px] text-muted">Tax</span>
            <span className="leader" />
            <span className="font-mono-tabular text-[13px] text-muted">{formatCents(result.taxCents)}</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-[13px] text-muted">Tip</span>
            <span className="leader" />
            <span className="font-mono-tabular text-[13px] text-muted">{formatCents(result.tipCents)}</span>
          </div>
          {result.feeCents > 0 && (
            <div className="flex items-baseline">
              <span className="text-[13px] text-muted">Other fees</span>
              <span className="leader" />
              <span className="font-mono-tabular text-[13px] text-muted">{formatCents(result.feeCents)}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-[16px] font-semibold">Grand total</span>
          <span className="font-mono-tabular text-[28px] font-bold">
            {formatCents(result.computedGrandTotalCents)}
          </span>
        </div>
      </div>
      <TornEdge />
    </StepShell>
  )
}
