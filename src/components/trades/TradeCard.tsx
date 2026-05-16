import Link from 'next/link'
import type { Trade } from '@prisma/client'
import { GradeBadge } from '@/components/ui/GradeBadge'
import { DirectionLabel } from '@/components/ui/DirectionLabel'
import { ResultPill } from '@/components/ui/ResultPill'
import { formatPips, formatPL, formatPrice } from '@/lib/utils'

interface TradeCardProps {
  trade: Trade
}

const sessionLabel: Record<string, string> = {
  LONDON: 'LON',
  NEW_YORK: 'NY',
  ASIA: 'ASIA',
}

export function TradeCard({ trade }: TradeCardProps) {
  const date = new Date(trade.entryAt)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <Link href={`/journal/${trade.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          padding: 14,
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--line-strong)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--line)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 12,
                fontFamily: 'IBM Plex Mono, monospace',
                color: 'var(--ink-dim)',
              }}
            >
              {dateStr}
            </span>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'IBM Plex Mono, monospace',
                color: 'var(--ink-faint)',
                background: 'var(--surface-2)',
                borderRadius: 3,
                padding: '1px 5px',
              }}
            >
              {sessionLabel[trade.session] || trade.session}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <DirectionLabel direction={trade.direction} />
            <GradeBadge grade={trade.grade} />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 6,
            marginBottom: 10,
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 12,
          }}
        >
          <div>
            <div style={{ color: 'var(--ink-faint)', fontSize: 10, marginBottom: 2 }}>ENTRY</div>
            <div style={{ color: 'var(--ink)' }}>{formatPrice(trade.entryPrice)}</div>
          </div>
          <div>
            <div style={{ color: 'var(--ink-faint)', fontSize: 10, marginBottom: 2 }}>SL</div>
            <div style={{ color: 'var(--red)' }}>{formatPrice(trade.stopLoss)}</div>
          </div>
          <div>
            <div style={{ color: 'var(--ink-faint)', fontSize: 10, marginBottom: 2 }}>TP</div>
            <div style={{ color: 'var(--green)' }}>{formatPrice(trade.takeProfit)}</div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTop: '1px solid var(--line)',
          }}
        >
          <ResultPill result={trade.result} />
          <div style={{ display: 'flex', gap: 12, fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>
            <span style={{ color: trade.pips >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {formatPips(trade.pips)} pips
            </span>
            <span style={{ color: 'var(--ink-dim)' }}>RR {trade.rr.toFixed(1)}</span>
          </div>
          <span
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 13,
              fontWeight: 600,
              color: trade.pl >= 0 ? 'var(--green)' : 'var(--red)',
            }}
          >
            {formatPL(trade.pl)}
          </span>
        </div>
      </div>
    </Link>
  )
}
