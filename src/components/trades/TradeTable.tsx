'use client'

import Link from 'next/link'
import type { Trade } from '@prisma/client'
import { GradeBadge } from '@/components/ui/GradeBadge'
import { formatPips, formatPL, formatPrice } from '@/lib/utils'
import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

type SortKey = 'entryAt' | 'pips' | 'pl' | 'rr' | 'grade'

interface TradeTableProps {
  trades: Trade[]
}

const sessionShort: Record<string, string> = {
  LONDON: 'LDN',
  NEW_YORK: 'NY',
  ASIA: 'ASIA',
}

export function TradeTable({ trades }: TradeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('entryAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...trades].sort((a, b) => {
    let av: number, bv: number
    if (sortKey === 'entryAt') {
      av = new Date(a.entryAt).getTime()
      bv = new Date(b.entryAt).getTime()
    } else if (sortKey === 'grade') {
      const order = { A_PLUS: 0, A: 1, B: 2, C: 3 }
      av = order[a.grade]
      bv = order[b.grade]
    } else {
      av = a[sortKey] as number
      bv = b[sortKey] as number
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'asc' ? (
        <ChevronUp size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
      ) : (
        <ChevronDown size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
      )
    ) : null

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="tj">
        <thead>
          <tr>
            <th onClick={() => handleSort('entryAt')} style={{ cursor: 'pointer' }}>
              Date <SortIcon k="entryAt" />
            </th>
            <th>Dir</th>
            <th>Session</th>
            <th>Entry</th>
            <th>SL</th>
            <th>TP</th>
            <th>Lots</th>
            <th onClick={() => handleSort('rr')} style={{ cursor: 'pointer' }}>
              R:R <SortIcon k="rr" />
            </th>
            <th onClick={() => handleSort('pips')} style={{ cursor: 'pointer' }}>
              Pips <SortIcon k="pips" />
            </th>
            <th onClick={() => handleSort('pl')} style={{ cursor: 'pointer' }}>
              P/L <SortIcon k="pl" />
            </th>
            <th onClick={() => handleSort('grade')} style={{ cursor: 'pointer' }}>
              Grade <SortIcon k="grade" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((trade) => {
            const date = new Date(trade.entryAt)
            const dateStr = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
            const timeStr = date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
            return (
              <tr key={trade.id} style={{ cursor: 'pointer' }}>
                <td>
                  <Link
                    href={`/journal/${trade.id}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {dateStr} {timeStr}
                  </Link>
                </td>
                <td
                  className={trade.direction === 'BUY' ? 'pos' : 'neg'}
                  style={{ fontWeight: 600 }}
                >
                  {trade.direction}
                </td>
                <td>{sessionShort[trade.session] || trade.session}</td>
                <td>{formatPrice(trade.entryPrice)}</td>
                <td>{formatPrice(trade.stopLoss)}</td>
                <td>{formatPrice(trade.takeProfit)}</td>
                <td>{trade.lots.toFixed(2)}</td>
                <td>1:{trade.rr.toFixed(1)}</td>
                <td className={trade.pips >= 0 ? 'pos' : 'neg'} style={{ fontWeight: 500 }}>
                  {formatPips(trade.pips)}
                </td>
                <td className={trade.pl >= 0 ? 'pos' : 'neg'} style={{ fontWeight: 500 }}>
                  {formatPL(trade.pl)}
                </td>
                <td>
                  <GradeBadge grade={trade.grade} />
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
            fontFamily: 'var(--mono)',
            fontSize: 13,
          }}
        >
          No trades
        </div>
      )}
    </div>
  )
}
