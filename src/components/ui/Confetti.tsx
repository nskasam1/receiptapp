import { useMemo, type CSSProperties } from 'react'

const COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-accent-text)', 'var(--color-muted)']
const COUNT = 18

interface Particle {
  key: number
  angle: number
  distance: number
  size: number
  delay: number
  color: string
}

export function Confetti() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: COUNT }, (_, i) => ({
      key: i,
      angle: (360 / COUNT) * i + (Math.random() * 14 - 7),
      distance: 70 + Math.random() * 50,
      size: 5 + Math.random() * 4,
      delay: Math.random() * 0.08,
      color: COLORS[i % COLORS.length],
    }))
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-celebration overflow-hidden"
      style={{ top: '35%' }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.key}
          className="animate-confetti-burst absolute left-1/2 top-0 rounded-full"
          style={
            {
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              '--angle': `${p.angle}deg`,
              '--distance': `${p.distance}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
