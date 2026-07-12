import { useEffect, useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { formatCents, parseDollarsToCents } from '../../lib/split'
import type { Item } from '../../lib/types'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { TornEdge } from '../ui/TornEdge'
import { Icon } from '../ui/Icon'

function ItemRow({
  item,
  isLast,
  onUpdate,
  onRemove,
  onSplit,
}: {
  item: Item
  isLast: boolean
  onUpdate: (patch: Partial<Pick<Item, 'name' | 'quantity' | 'totalPriceCents'>>) => void
  onRemove: () => void
  onSplit: () => void
}) {
  const [priceText, setPriceText] = useState(
    item.totalPriceCents ? formatCents(item.totalPriceCents).slice(1) : '',
  )

  useEffect(() => {
    setPriceText(item.totalPriceCents ? formatCents(item.totalPriceCents).slice(1) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  return (
    <li
      className={`animate-rise px-4 py-3.5 ${!isLast ? 'border-b' : ''} ${
        item.lowConfidence ? 'border-dashed border-accent-text' : 'border-border'
      }`}
    >
      <div className="flex items-baseline">
        {item.lowConfidence && (
          <span
            aria-hidden="true"
            className="mr-1.5 h-[7px] w-[7px] shrink-0 translate-y-[-2px] rounded-full bg-accent"
          />
        )}
        <input
          value={item.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Item name"
          aria-label="Item name"
          className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-ink placeholder:text-muted"
        />
        <span className="leader" />
        <span className="flex shrink-0 items-center gap-1 font-mono-tabular text-[16px] font-semibold text-ink">
          $
          <input
            inputMode="decimal"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            onBlur={() => onUpdate({ totalPriceCents: parseDollarsToCents(priceText) })}
            placeholder="0.00"
            aria-label="Item price"
            className="w-[4.5ch] bg-transparent text-right font-mono-tabular text-[16px] font-semibold text-ink placeholder:text-muted"
          />
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-lg bg-surface-2">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => onUpdate({ quantity: Math.max(1, item.quantity - 1) })}
            className="flex h-7 w-7 items-center justify-center text-[13px] text-muted"
          >
            −
          </button>
          <span className="w-4 text-center font-mono-tabular text-[12px] text-muted">{item.quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => onUpdate({ quantity: item.quantity + 1 })}
            className="flex h-7 w-7 items-center justify-center text-[13px] text-muted"
          >
            +
          </button>
        </div>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onSplit}
          aria-label="Split this item into two"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
        >
          <Icon name="split" size={16} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Delete item"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-accent-text"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </li>
  )
}

export function ItemsStep() {
  const items = useReceiptStore((s) => s.items)
  const addItem = useReceiptStore((s) => s.addItem)
  const updateItem = useReceiptStore((s) => s.updateItem)
  const removeItem = useReceiptStore((s) => s.removeItem)
  const splitItem = useReceiptStore((s) => s.splitItem)
  const nextStep = useReceiptStore((s) => s.nextStep)
  const prevStep = useReceiptStore((s) => s.prevStep)

  const subtotalCents = items.reduce((sum, i) => sum + i.totalPriceCents, 0)
  const canContinue = items.length > 0 && items.every((i) => i.name.trim() && i.totalPriceCents > 0)
  const lowConfidenceCount = items.filter((i) => i.lowConfidence).length

  const duplicateNames = new Set(
    items
      .map((i) => i.name.trim().toLowerCase())
      .filter((name, idx, arr) => name && arr.indexOf(name) !== idx),
  )

  return (
    <StepShell
      title="What's on the receipt?"
      stepIndex={2}
      stepCount={7}
      onBack={prevStep}
      bottomBar={
        <BottomBar
          primaryLabel="Continue"
          primaryDisabled={!canContinue}
          onPrimary={nextStep}
          info={
            <span className="text-[13px] text-muted">
              Subtotal{' '}
              <span className="font-mono-tabular font-semibold text-ink">{formatCents(subtotalCents)}</span>
            </span>
          }
        />
      }
    >
      {lowConfidenceCount > 0 && (
        <p className="mb-3 flex items-center gap-1.5 text-[13px] text-accent-text">
          <Icon name="alert" size={14} />
          {lowConfidenceCount} item{lowConfidenceCount === 1 ? '' : 's'} came out a little unclear — marked
          below, worth a glance.
        </p>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <Icon name="receipt" size={24} className="mx-auto mb-2 text-muted" />
          <p className="text-[14px] text-muted">
            Add each line from the receipt — name and price. Quantity is just for your reference.
          </p>
        </div>
      ) : (
        <div className="rounded-t-xl border border-b-0 border-border bg-surface">
          <ul>
            {items.map((item, i) => (
              <ItemRow
                key={item.id}
                item={item}
                isLast={i === items.length - 1}
                onUpdate={(patch) => updateItem(item.id, patch)}
                onRemove={() => removeItem(item.id)}
                onSplit={() => splitItem(item.id)}
              />
            ))}
          </ul>
          <TornEdge />
        </div>
      )}

      {duplicateNames.size > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-[13px] text-accent-text">
          <Icon name="alert" size={14} />
          Two items share a name — worth double-checking that's not a duplicate scan.
        </p>
      )}

      <button
        type="button"
        onClick={addItem}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-3 text-[14px] font-medium text-primary hover:border-primary"
      >
        <Icon name="plus" size={16} />
        Add item
      </button>
    </StepShell>
  )
}
