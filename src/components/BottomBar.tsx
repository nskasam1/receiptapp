import type { ReactNode } from 'react'

export function BottomBar({
  info,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  secondary,
  variant = 'primary',
}: {
  info?: ReactNode
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  secondary?: ReactNode
  variant?: 'primary' | 'accent'
}) {
  return (
    <div
      className="sticky bottom-0 z-sticky border-t border-border bg-surface/95 px-4 pt-3 backdrop-blur-sm"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
    >
      <div className="mx-auto flex max-w-md items-center gap-3">
        {info && <div className="min-w-0 flex-1">{info}</div>}
        <div className="flex shrink-0 items-center gap-2">
          {secondary}
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className={`rounded-xl px-5 py-3 text-[15px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-35 ${
              variant === 'accent'
                ? 'bg-accent text-accent-ink hover:bg-accent/90'
                : 'bg-primary text-primary-ink hover:bg-primary-hover'
            }`}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
