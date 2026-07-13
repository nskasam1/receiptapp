import type { ReactNode } from 'react'
import { Icon } from './ui/Icon'
import { useNavigationDirection } from '../lib/navigationDirection'

export function StepShell({
  title,
  stepIndex,
  stepCount,
  onBack,
  children,
  bottomBar,
}: {
  title: string
  stepIndex?: number
  stepCount?: number
  onBack?: () => void
  children: ReactNode
  bottomBar?: ReactNode
}) {
  const showProgress = stepIndex !== undefined && stepCount !== undefined
  const progress = showProgress ? ((stepIndex + 1) / stepCount) * 100 : 0
  const direction = useNavigationDirection()

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <header className="sticky top-0 z-sticky bg-bg/95 backdrop-blur-sm">
        {showProgress && (
          <div className="h-[2px] bg-surface-2">
            <div
              className="h-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <div
          className="flex items-center gap-1 px-3 pb-3"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
        >
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink"
            >
              <Icon name="chevron-left" />
            </button>
          ) : (
            <div className="w-9 shrink-0" />
          )}
          <h1 className="flex-1 truncate text-center text-[19px] font-semibold">{title}</h1>
          <span className="font-mono-tabular w-9 shrink-0 text-right text-[12px] text-muted">
            {showProgress ? `${stepIndex + 1}/${stepCount}` : ''}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 pb-6">
        <div
          key={stepIndex ?? title}
          className={direction === 'back' ? 'animate-slide-in-back mx-auto max-w-md pt-4' : 'animate-slide-in-forward mx-auto max-w-md pt-4'}
        >
          {children}
        </div>
      </main>

      {bottomBar}
    </div>
  )
}
