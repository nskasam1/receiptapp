import { personColorVar } from '../../store/useReceiptStore'
import { initialsFor } from '../../lib/format'

export function PersonAvatar({
  name,
  index,
  size = 32,
}: {
  name: string
  index: number
  size?: number
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundColor: personColorVar(index),
      }}
    >
      {initialsFor(name)}
    </span>
  )
}
