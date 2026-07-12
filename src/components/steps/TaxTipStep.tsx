import { useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { computeTipCents, formatCents, parseDollarsToCents } from '../../lib/split'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { Toggle } from '../ui/Toggle'

function MoneyInput({
  cents,
  onCommit,
  placeholder = '0.00',
}: {
  cents: number
  onCommit: (cents: number) => void
  placeholder?: string
}) {
  const [text, setText] = useState(cents ? formatCents(cents).slice(1) : '')
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2.5">
      <span className="font-mono-tabular text-[15px] text-muted">$</span>
      <input
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onCommit(parseDollarsToCents(text))}
        placeholder={placeholder}
        className="w-full bg-transparent font-mono-tabular text-[15px] text-ink placeholder:text-muted"
      />
    </div>
  )
}

export function TaxTipStep() {
  const items = useReceiptStore((s) => s.items)
  const taxCents = useReceiptStore((s) => s.taxCents)
  const setTaxCents = useReceiptStore((s) => s.setTaxCents)
  const tipMode = useReceiptStore((s) => s.tipMode)
  const setTipMode = useReceiptStore((s) => s.setTipMode)
  const tipValue = useReceiptStore((s) => s.tipValue)
  const setTipValue = useReceiptStore((s) => s.setTipValue)
  const tipBasis = useReceiptStore((s) => s.tipBasis)
  const setTipBasis = useReceiptStore((s) => s.setTipBasis)
  const splitBasis = useReceiptStore((s) => s.splitBasis)
  const setSplitBasis = useReceiptStore((s) => s.setSplitBasis)
  const enteredGrandTotalCents = useReceiptStore((s) => s.enteredGrandTotalCents)
  const setEnteredGrandTotalCents = useReceiptStore((s) => s.setEnteredGrandTotalCents)
  const nextStep = useReceiptStore((s) => s.nextStep)
  const prevStep = useReceiptStore((s) => s.prevStep)

  const subtotalCents = items.reduce((sum, i) => sum + i.totalPriceCents, 0)
  const tipCents = computeTipCents(tipMode, tipValue, tipBasis, subtotalCents, taxCents)
  const totalCents = subtotalCents + taxCents + tipCents

  return (
    <StepShell
      title="Tax & tip"
      stepIndex={4}
      stepCount={7}
      onBack={prevStep}
      bottomBar={
        <BottomBar
          primaryLabel="See the split"
          onPrimary={nextStep}
          info={
            <span className="text-[13px] text-muted">
              Total{' '}
              <span className="font-mono-tabular font-semibold text-ink">{formatCents(totalCents)}</span>
            </span>
          }
        />
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <label className="mb-1.5 block text-[13px] text-muted">Tax (as shown on the receipt)</label>
          <MoneyInput cents={taxCents} onCommit={setTaxCents} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[13px] text-muted">Tip</span>
            <Toggle
              value={tipMode}
              onChange={(v) => setTipMode(v)}
              options={[
                { value: 'percent', label: '%' },
                { value: 'flat', label: '$' },
              ]}
            />
          </div>
          {tipMode === 'percent' ? (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={35}
                step={1}
                value={tipValue}
                onChange={(e) => setTipValue(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="font-mono-tabular w-14 shrink-0 text-right text-[16px] font-semibold">
                {tipValue}%
              </span>
            </div>
          ) : (
            <MoneyInput cents={Math.round(tipValue * 100)} onCommit={(c) => setTipValue(c / 100)} />
          )}
          {tipMode === 'percent' && (
            <div className="mt-2">
              <Toggle
                value={tipBasis}
                onChange={setTipBasis}
                options={[
                  { value: 'subtotal', label: 'Of subtotal' },
                  { value: 'total', label: 'Of subtotal + tax' },
                ]}
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] text-muted">Split tax &amp; tip</label>
          <Toggle
            value={splitBasis}
            onChange={setSplitBasis}
            options={[
              { value: 'proportional', label: 'By what they ordered' },
              { value: 'even', label: 'Evenly per person' },
            ]}
          />
        </div>

        <div>
          <div className="flex justify-between text-[14px] text-muted">
            <span>Subtotal</span>
            <span className="font-mono-tabular text-ink">{formatCents(subtotalCents)}</span>
          </div>
          <div className="mt-2 flex justify-between text-[14px] text-muted">
            <span>Tax</span>
            <span className="font-mono-tabular text-ink">{formatCents(taxCents)}</span>
          </div>
          <div className="mt-2 flex justify-between text-[14px] text-muted">
            <span>Tip</span>
            <span className="font-mono-tabular text-ink">{formatCents(tipCents)}</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-[15px] font-semibold">Total</span>
            <span key={totalCents} className="animate-settle font-mono-tabular text-[22px] font-bold">
              {formatCents(totalCents)}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] text-muted">
            Receipt's grand total (optional — lets us double-check the math)
          </label>
          <MoneyInput
            cents={enteredGrandTotalCents ?? 0}
            onCommit={(c) => setEnteredGrandTotalCents(c > 0 ? c : null)}
          />
        </div>
      </div>
    </StepShell>
  )
}
