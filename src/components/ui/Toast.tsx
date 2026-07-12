import { useEffect } from 'react'
import { Icon } from './Icon'

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      role="status"
      className="animate-toast-in fixed bottom-24 left-1/2 z-toast flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-[14px] font-medium text-ink"
    >
      <Icon name="check" size={16} className="text-primary" />
      {message}
    </div>
  )
}
