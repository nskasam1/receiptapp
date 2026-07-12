import { personColorVar } from '../../store/useReceiptStore'
import { initialsFor } from '../../lib/format'
import { Icon } from './Icon'

export function PersonChip({
  name,
  index,
  selected,
  units,
  onToggle,
  onIncrement,
  onDecrement,
}: {
  name: string
  index: number
  selected: boolean
  units?: number
  onToggle: () => void
  onIncrement?: () => void
  onDecrement?: () => void
}) {
  const color = personColorVar(index)
  const showStepper = selected && units !== undefined && onIncrement && onDecrement

  return (
    <div
      className="flex items-center gap-1 rounded-full border py-1 pl-1 pr-2.5 transition-colors duration-150"
      style={{
        borderColor: selected ? color : 'var(--color-border)',
        backgroundColor: selected ? color : 'var(--color-surface-2)',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        className="flex items-center gap-1.5"
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
          style={{
            backgroundColor: selected ? 'rgb(0 0 0 / 0.16)' : color,
            color: 'white',
          }}
        >
          {initialsFor(name)}
        </span>
        <span className={`text-[14px] font-medium ${selected ? 'text-white' : 'text-ink'}`}>
          {name || 'Unnamed'}
        </span>
      </button>
      {showStepper && (
        <span className="ml-0.5 flex items-center gap-1 border-l border-white/25 pl-1.5">
          <button
            type="button"
            onClick={onDecrement}
            aria-label={`Fewer units for ${name}`}
            className="flex h-5 w-5 items-center justify-center rounded-full text-white/90 hover:bg-black/15"
          >
            <Icon name="chevron-left" size={12} className="rotate-[-90deg]" />
          </button>
          <span className="min-w-[1ch] text-center text-[12px] font-semibold tabular-nums text-white">
            {units}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            aria-label={`More units for ${name}`}
            className="flex h-5 w-5 items-center justify-center rounded-full text-white/90 hover:bg-black/15"
          >
            <Icon name="chevron-left" size={12} className="rotate-90" />
          </button>
        </span>
      )}
    </div>
  )
}
