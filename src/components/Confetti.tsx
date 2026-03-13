import { useEffect, useMemo } from 'react'

// Matches the project's existing sparkle trail palette
const COLORS = ['#FFD700', '#FF5533', '#007B7B', '#1A1A6E', '#FF9900', '#00FF41']
const COUNT  = 55

interface Particle {
  id:       number
  left:     string
  delay:    string
  duration: string
  size:     string
  color:    string
}

interface Props {
  onDone: () => void
}

export default function Confetti({ onDone }: Props) {
  // Auto-remove after longest possible animation completes
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  const particles: Particle[] = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      id:       i,
      left:     `${Math.random() * 100}%`,
      delay:    `${(Math.random() * 0.7).toFixed(2)}s`,
      duration: `${(1.8 + Math.random() * 1.2).toFixed(2)}s`,
      size:     `${6 + Math.floor(Math.random() * 9)}px`,
      color:    COLORS[i % COLORS.length],
    }))
  , [])

  return (
    <div className="confetti-overlay" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left:              p.left,
            width:             p.size,
            height:            p.size,
            background:        p.color,
            animationDelay:    p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  )
}
