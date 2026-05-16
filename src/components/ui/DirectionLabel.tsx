import type { Direction } from '@prisma/client'

export function DirectionLabel({
  direction,
  size = 'sm',
}: {
  direction: Direction
  size?: 'sm' | 'md'
}) {
  const isBuy = direction === 'BUY'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'var(--hand)',
        fontSize: size === 'md' ? 18 : 14,
        fontWeight: 700,
        color: isBuy ? 'var(--green)' : 'var(--red)',
      }}
    >
      {isBuy ? '▲' : '▼'} {direction}
    </span>
  )
}
