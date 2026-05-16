import type { Result } from '@prisma/client'

const pillStyles: Record<Result, { color: string; bg: string }> = {
  WIN: { color: 'var(--green)', bg: 'var(--green)' },
  LOSS: { color: 'var(--red)', bg: 'var(--red)' },
  BREAKEVEN: { color: 'var(--amber)', bg: 'var(--amber)' },
  OPEN: { color: 'var(--blue)', bg: 'var(--blue)' },
}

export function ResultPill({ result }: { result: Result }) {
  const s = pillStyles[result]
  return (
    <span
      style={{
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 11,
        fontWeight: 600,
        color: s.color,
        background: `${s.bg}22`,
        border: `1px solid ${s.bg}44`,
        borderRadius: 4,
        padding: '2px 7px',
        display: 'inline-block',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {result}
    </span>
  )
}
