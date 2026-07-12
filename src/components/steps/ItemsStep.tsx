import { useEffect, useState } from 'react'
import { useReceiptStore } from '../../store/useReceiptStore'
import { formatCents, parseDollarsToCents } from '../../lib/split'
import type { Item } from '../../lib/types'
import { StepShell } from '../StepShell'
import { BottomBar } from '../BottomBar'
import { Icon } from '../ui/Icon'

function ItemRow({
  item,
  onUpdate,
  onRemove,
  onSplit,
}: {
  item: Item
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
    <li className="animate-rise rounded-xl bg-surface p-3">
      <input
        value={item.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="Item name"
        className="w-full bg-transparent text-[15px] font-medium text-ink placeholder:text-faint focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-surface-2 px-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => onUpdate({ quantity: Math.max(1, item.quantity - 1) })}
            className="flex h-8 w-8 items-center justify-center text-muted"
          >
            −
          </button>
          <span className="w-5 text-center text-[14px] tabular-nums">{item.quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => onUpdate({ quantity: item.quantity + 1 })}
            className="flex h-8 w-8 items-center justify-center text-muted"
          >
            +
          </button>
        </div>

        <div className="flex flex-1 items-center gap-1 rounded-lg border border-border bg-transparent px-3 py-2">
          <span className="text-[15px] text-faint">$</span>
          <input
            inputMode="decimal"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            onBlur={() => onUpdate({ totalPriceCents: parseDollarsToCents(priceText) })}
            placeholder="0.00"
            className="w-full bg-transparent text-[15px] tabular-nums text-ink placeholder:text-faint focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onSplit}
          aria-label="Split this item into two"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-faint hover:bg-surface-2 hover:text-ink"
        >
          <Icon name="split" size={17} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Delete item"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-faint hover:bg-surface-2 hover:text-danger"
        >
          <Icon name="trash" size={17} />
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
              Subtotal <span className="font-semibold text-ink tabular-nums">{formatCents(subtotalCents)}</span>
            </span>
          }
        />
      }
    >
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <Icon name="receipt" size={22} className="mx-auto mb-2 text-faint" />
          <p className="text-[14px] text-muted">
            Add each line from the receipt — name and price. Quantity is just for your reference.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onUpdate={(patch) => updateItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
              onSplit={() => splitItem(item.id)}
            />
          ))}
        </ul>
      )}

      {duplicateNames.size > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-[13px] text-accent">
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
