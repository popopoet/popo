'use client'

import type { ConfluenceData } from '@/lib/utils'

const ITEMS: { key: keyof ConfluenceData; label: string }[] = [
  { key: 'trendAlignment', label: 'Trend Alignment' },
  { key: 'keyLevel', label: 'Key Level' },
  { key: 'candlePattern', label: 'Candle Pattern' },
  { key: 'riskReward', label: 'Risk/Reward ≥ 1:2' },
]

interface ConfluenceChecklistProps {
  confluence: ConfluenceData
  onChange?: (updated: ConfluenceData) => void
  readonly?: boolean
}

export function ConfluenceChecklist({ confluence, onChange, readonly }: ConfluenceChecklistProps) {
  const count = Object.values(confluence).filter(Boolean).length

  function toggle(key: keyof ConfluenceData) {
    if (readonly || !onChange) return
    onChange({ ...confluence, [key]: !confluence[key] })
  }

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontFamily: 'IBM Plex Mono, monospace',
          color: 'var(--ink-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 10,
        }}
      >
        Confluence ({count}/4)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ITEMS.map(({ key, label }) => {
          const checked = !!confluence[key]
          return (
            <label
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: readonly ? 'default' : 'pointer',
                userSelect: 'none',
              }}
              onClick={() => toggle(key)}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: `1px solid ${checked ? 'var(--green)' : 'var(--line-strong)'}`,
                  background: checked ? 'var(--green)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#0c0d10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  color: checked ? 'var(--ink)' : 'var(--ink-dim)',
                }}
              >
                {label}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
