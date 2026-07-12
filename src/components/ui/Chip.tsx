import { initialsFor } from '../../lib/format'
import { Icon } from './Icon'

export function PersonChip({
  name,
  selected,
  units,
  onToggle,
  onIncrement,
  onDecrement,
}: {
  name: string
  selected: boolean
  units?: number
  onToggle: () => void
  onIncrement?: () => void
  onDecrement?: () => void
}) {
  const showStepper = selected && units !== undefined && onIncrement && onDecrement

  return (
    <div
      className={`flex origin-left items-center gap-1 rounded-full border py-1 pl-1 pr-2.5 transition-[transform,background-color,border-color] duration-150 ${
        selected ? 'scale-[1.05] border-accent bg-accent' : 'border-primary/25 bg-surface'
      }`}
    >
      <button type="button" onClick={onToggle} aria-pressed={selected} className="flex items-center gap-1.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-ink">
          {initialsFor(name)}
        </span>
        <span className={`text-[14px] font-medium ${selected ? 'text-accent-ink' : 'text-ink'}`}>
          {name || 'Unnamed'}
        </span>
      </button>
      {showStepper && (
        <span className="ml-0.5 flex items-center gap-0.5 border-l border-accent-ink/20 pl-1">
          <button
            type="button"
            onClick={onDecrement}
            aria-label={`Fewer units for ${name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-accent-ink/80 hover:bg-black/10"
          >
            <Icon name="chevron-left" size={13} className="rotate-[-90deg]" />
          </button>
          <span className="font-mono-tabular min-w-[1.5ch] text-center text-[13px] font-semibold text-accent-ink">
            {units}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            aria-label={`More units for ${name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-accent-ink/80 hover:bg-black/10"
          >
            <Icon name="chevron-left" size={13} className="rotate-90" />
          </button>
        </span>
      )}
    </div>
  )
}
