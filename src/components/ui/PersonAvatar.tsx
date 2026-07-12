import { initialsFor } from '../../lib/format'

export function PersonAvatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-ink"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initialsFor(name)}
    </span>
  )
}
