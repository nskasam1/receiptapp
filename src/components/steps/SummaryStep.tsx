import { useMemo } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { computeSplit, computeTipCents, formatCents } from '../../lib/split'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { PersonAvatar } from '../ui/PersonAvatar'
import { Icon } from '../ui/Icon'

export function SummaryStep() {
  const people = useReceiptStore((s) => s.people)
  const items = useReceiptStore((s) => s.items)
  const taxCents = useReceiptStore((s) => s.taxCents)
  const tipMode = useReceiptStore((s) => s.tipMode)
  const tipValue = useReceiptStore((s) => s.tipValue)
  const tipBasis = useReceiptStore((s) => s.tipBasis)
  const splitBasis = useReceiptStore((s) => s.splitBasis)
  const enteredGrandTotalCents = useReceiptStore((s) => s.enteredGrandTotalCents)
  const nextStep = useReceiptStore((s) => s.nextStep)
  const prevStep = useReceiptStore((s) => s.prevStep)

  const result = useMemo(() => {
    const subtotalCents = items.reduce((sum, i) => sum + i.totalPriceCents, 0)
    const tipCents = computeTipCents(tipMode, tipValue, tipBasis, subtotalCents, taxCents)
    return computeSplit({ people, items, taxCents, tipCents, splitBasis, enteredGrandTotalCents })
  }, [people, items, taxCents, tipMode, tipValue, tipBasis, splitBasis, enteredGrandTotalCents])

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
              <span className="font-semibold text-ink tabular-nums">
                {formatCents(result.computedGrandTotalCents)}
              </span>
            </span>
          }
        />
      }
    >
      {enteredGrandTotalCents !== null && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] ${
            result.reconciles ? 'bg-surface text-muted' : 'bg-surface text-accent'
          }`}
        >
          <Icon name={result.reconciles ? 'check' : 'alert'} size={16} className={result.reconciles ? 'text-success' : 'text-accent'} />
          {result.reconciles ? (
            <span>Matches the receipt's total.</span>
          ) : (
            <span>
              Off by {formatCents(Math.abs(result.differenceCents))} from the receipt's{' '}
              {formatCents(enteredGrandTotalCents)} total — worth a second look.
            </span>
          )}
        </div>
      )}

      {result.unassignedItemCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-surface px-3.5 py-2.5 text-[13px] text-accent">
          <Icon name="alert" size={16} />
          {result.unassignedItemCount} item{result.unassignedItemCount === 1 ? '' : 's'} not assigned to
          anyone — left out of the split.
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {result.people.map((split, index) => (
          <li key={split.personId} className="rounded-xl bg-surface p-3.5">
            <div className="flex items-center gap-3">
              <PersonAvatar name={split.name} index={index} />
              <span className="flex-1 truncate text-[15px] font-medium">{split.name}</span>
              <span className="text-[19px] font-semibold tabular-nums">{formatCents(split.totalCents)}</span>
            </div>
            {(split.items.length > 0 || split.taxShareCents > 0 || split.tipShareCents > 0) && (
              <div className="mt-2.5 flex flex-col gap-1 border-t border-border pt-2.5 pl-11">
                {split.items.map((line, i) => (
                  <div key={i} className="flex justify-between text-[13px] text-muted">
                    <span className="truncate">{line.name}</span>
                    <span className="tabular-nums">{formatCents(line.shareCents)}</span>
                  </div>
                ))}
                {split.taxShareCents > 0 && (
                  <div className="flex justify-between text-[13px] text-muted">
                    <span>tax</span>
                    <span className="tabular-nums">{formatCents(split.taxShareCents)}</span>
                  </div>
                )}
                {split.tipShareCents > 0 && (
                  <div className="flex justify-between text-[13px] text-muted">
                    <span>tip</span>
                    <span className="tabular-nums">{formatCents(split.tipShareCents)}</span>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </StepShell>
  )
}
