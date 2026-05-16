'use client'

interface BarItem {
  label: string
  value: number
  color?: string
}

interface BreakdownBarsProps {
  title: string
  items: BarItem[]
}

export function BreakdownBars({ title, items }: BreakdownBarsProps) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1)

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontFamily: 'IBM Plex Mono, monospace',
          color: 'var(--ink-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item) => {
          const pct = Math.abs(item.value) / max
          const color = item.color || (item.value >= 0 ? 'var(--green)' : 'var(--red)')
          return (
            <div key={item.label}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--ink-dim)', fontFamily: 'Inter, sans-serif' }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontWeight: 600,
                    color,
                  }}
                >
                  {item.value >= 0 ? '+' : ''}{item.value.toFixed(0)}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: 'var(--surface-2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct * 100}%`,
                    background: color,
                    borderRadius: 3,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
