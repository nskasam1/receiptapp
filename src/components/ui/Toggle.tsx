export function Toggle<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  label?: string
}) {
  return (
    <div>
      {label && <div className="mb-1.5 text-[13px] text-muted">{label}</div>}
      <div role="radiogroup" className="inline-flex rounded-lg bg-surface-2 p-1">
        {options.map((opt) => {
          const selected = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={`rounded-md px-3.5 py-1.5 text-[14px] font-medium transition-colors duration-150 ${
                selected ? 'bg-primary text-primary-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
