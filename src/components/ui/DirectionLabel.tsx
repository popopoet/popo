import type { Direction } from '@prisma/client'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function DirectionLabel({ direction }: { direction: Direction }) {
  const isBuy = direction === 'BUY'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 12,
        fontWeight: 600,
        color: isBuy ? 'var(--green)' : 'var(--red)',
      }}
    >
      {isBuy ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {direction}
    </span>
  )
}
