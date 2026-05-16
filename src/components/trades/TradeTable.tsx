'use client'

import Link from 'next/link'
import type { Trade } from '@prisma/client'
import { GradeBadge } from '@/components/ui/GradeBadge'
import { DirectionLabel } from '@/components/ui/DirectionLabel'
import { ResultPill } from '@/components/ui/ResultPill'
import { formatPips, formatPL, formatPrice } from '@/lib/utils'
import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

type SortKey = 'entryAt' | 'pips' | 'pl' | 'rr' | 'grade'

interface TradeTableProps {
  trades: Trade[]
}

export function TradeTable({ trades }: TradeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('entryAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...trades].sort((a, b) => {
    let av: number | string, bv: number | string
    if (sortKey === 'entryAt') {
      av = new Date(a.entryAt).getTime()
      bv = new Date(b.entryAt).getTime()
    } else if (sortKey === 'grade') {
      const order = { A_PLUS: 0, A: 1, B: 2, C: 3 }
      av = order[a.grade]
      bv = order[b.grade]
    } else {
      av = a[sortKey]
      bv = b[sortKey]
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const colStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 11,
    color: 'var(--ink-faint)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />
    ) : null

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            <th style={colStyle} onClick={() => handleSort('entryAt')}>
              Date <SortIcon k="entryAt" />
            </th>
            <th style={colStyle}>Dir</th>
            <th style={colStyle}>Session</th>
            <th style={colStyle}>Entry</th>
            <th style={colStyle}>SL</th>
            <th style={colStyle}>TP</th>
            <th style={colStyle}>Lots</th>
            <th style={colStyle} onClick={() => handleSort('rr')}>
              RR <SortIcon k="rr" />
            </th>
            <th style={colStyle} onClick={() => handleSort('pips')}>
              Pips <SortIcon k="pips" />
            </th>
            <th style={colStyle} onClick={() => handleSort('pl')}>
              P/L <SortIcon k="pl" />
            </th>
            <th style={colStyle} onClick={() => handleSort('grade')}>
              Grade <SortIcon k="grade" />
            </th>
            <th style={colStyle}>Result</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((trade) => {
            const date = new Date(trade.entryAt)
            const dateStr = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: '2-digit',
            })
            return (
              <tr
                key={trade.id}
                style={{ borderBottom: '1px solid var(--line)', transition: 'background 0.1s' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface-2)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                }}
              >
                <td style={{ padding: '10px 12px' }}>
                  <Link
                    href={`/journal/${trade.id}`}
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: 12,
                      color: 'var(--ink-dim)',
                      textDecoration: 'none',
                    }}
                  >
                    {dateStr}
                  </Link>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <DirectionLabel direction={trade.direction} />
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 11,
                    color: 'var(--ink-faint)',
                  }}
                >
                  {trade.session}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 12,
                    color: 'var(--ink)',
                  }}
                >
                  {formatPrice(trade.entryPrice)}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 12,
                    color: 'var(--red)',
                  }}
                >
                  {formatPrice(trade.stopLoss)}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 12,
                    color: 'var(--green)',
                  }}
                >
                  {formatPrice(trade.takeProfit)}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 12,
                    color: 'var(--ink-dim)',
                  }}
                >
                  {trade.lots.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 12,
                    color: 'var(--ink)',
                  }}
                >
                  {trade.rr.toFixed(1)}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 12,
                    fontWeight: 600,
                    color: trade.pips >= 0 ? 'var(--green)' : 'var(--red)',
                  }}
                >
                  {formatPips(trade.pips)}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 12,
                    fontWeight: 600,
                    color: trade.pl >= 0 ? 'var(--green)' : 'var(--red)',
                  }}
                >
                  {formatPL(trade.pl)}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <GradeBadge grade={trade.grade} />
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <ResultPill result={trade.result} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--ink-faint)',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 13,
          }}
        >
          No trades found
        </div>
      )}
    </div>
  )
}
