'use client'

import { ReactNode } from 'react'

interface BarItem {
  label: string | ReactNode
  value: number
  color?: string
}

interface BreakdownBarsProps {
  title?: string
  items: BarItem[]
  unit?: string
}

export function BreakdownBars({ title, items, unit = 'p' }: BreakdownBarsProps) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1)

  return (
    <div>
      {title && (
        <h4 style={{ fontFamily: 'var(--hand)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
          {title}
        </h4>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => {
          const pct = Math.abs(item.value) / max
          const positive = item.value >= 0
          const stripeColor = positive ? 'var(--green)' : 'var(--red)'
          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr 60px',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--hand)',
                  fontSize: 14,
                  color: 'var(--ink-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {item.label}
              </span>
              <div
                style={{
                  height: 10,
                  borderRadius: 99,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--line)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: `${(1 - pct) * 100}%`,
                    background: `repeating-linear-gradient(90deg, ${stripeColor} 0 4px, transparent 4px 8px)`,
                    opacity: 0.75,
                    transition: 'right 0.4s ease',
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  textAlign: 'right',
                  color: positive ? 'var(--green)' : 'var(--red)',
                  fontWeight: 500,
                }}
              >
                {positive ? '+' : ''}
                {Math.round(item.value)}
                {unit}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
