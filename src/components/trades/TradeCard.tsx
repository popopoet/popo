'use client'

import Link from 'next/link'
import type { Trade } from '@prisma/client'
import { GradeBadge } from '@/components/ui/GradeBadge'
import { DirectionLabel } from '@/components/ui/DirectionLabel'
import { formatPips, formatPrice } from '@/lib/utils'

interface TradeCardProps {
  trade: Trade
}

const sessionLabel: Record<string, string> = {
  LONDON: 'London',
  NEW_YORK: 'NY',
  ASIA: 'Asia',
}

export function TradeCard({ trade }: TradeCardProps) {
  const date = new Date(trade.entryAt)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const positive = trade.pips >= 0

  return (
    <Link
      href={`/journal/${trade.id}`}
      style={{ display: 'block', textDecoration: 'none' }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          transition: 'border-color 0.15s',
          height: '100%',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--line-strong)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--line)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--ink-faint)',
                marginBottom: 2,
              }}
            >
              {dateStr} · {timeStr} · {sessionLabel[trade.session] || trade.session}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <DirectionLabel direction={trade.direction} size="md" />
              <span style={{ fontFamily: 'var(--hand)', fontSize: 18 }}>XAUUSD</span>
            </div>
          </div>
          <GradeBadge grade={trade.grade} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          {[
            { label: 'Entry', value: formatPrice(trade.entryPrice) },
            { label: 'SL', value: formatPrice(trade.stopLoss) },
            { label: 'TP', value: formatPrice(trade.takeProfit) },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                  letterSpacing: '0.12em',
                }}
              >
                {s.label}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink)' }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--line)',
            paddingTop: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontWeight: 500,
              fontSize: 13,
              color: positive ? 'var(--green)' : 'var(--red)',
            }}
          >
            {trade.result === 'OPEN' ? 'OPEN' : `${trade.result} · ${formatPips(trade.pips)}p`}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-faint)' }}>
            R:R 1:{trade.rr.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  )
}
