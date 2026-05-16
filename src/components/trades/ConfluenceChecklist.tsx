'use client'

import type { ConfluenceData } from '@/lib/utils'

const ITEMS: { key: keyof ConfluenceData; label: string; metaKey?: keyof ConfluenceData }[] = [
  { key: 'sndFresh', label: 'SND zone freshness', metaKey: 'sndTimeframe' },
  { key: 'bosChoCh', label: 'BOS / CHoCH confirmed', metaKey: 'bosTimeframe' },
  { key: 'volume', label: 'Volume confirmation', metaKey: 'volumeNote' },
  { key: 'fundamental', label: 'Fundamental aligned', metaKey: 'fundamentalNote' },
]

interface ConfluenceChecklistProps {
  confluence: ConfluenceData
  onChange?: (updated: ConfluenceData) => void
  readonly?: boolean
}

export function ConfluenceChecklist({ confluence, onChange, readonly }: ConfluenceChecklistProps) {
  function toggle(key: keyof ConfluenceData) {
    if (readonly || !onChange) return
    onChange({ ...confluence, [key]: !confluence[key] })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {ITEMS.map(({ key, label, metaKey }) => {
        const checked = Boolean(confluence[key])
        const meta = metaKey ? confluence[metaKey] : undefined
        return (
          <div
            key={key}
            onClick={() => toggle(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              border: '1px solid var(--line)',
              borderRadius: 6,
              background: 'var(--surface)',
              cursor: readonly ? 'default' : 'pointer',
              opacity: checked ? 1 : 0.55,
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: `1px solid ${checked ? 'var(--green)' : 'var(--line-strong)'}`,
                color: 'var(--green)',
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              {checked && '✓'}
            </div>
            <div style={{ fontFamily: 'var(--hand)', fontSize: 15, flex: 1, color: 'var(--ink)' }}>
              {label}
            </div>
            {meta !== undefined && meta !== '' && meta !== null && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-faint)' }}>
                {String(meta)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
