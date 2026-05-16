'use client'

import Link from 'next/link'
import type { Trade } from '@prisma/client'
import { ResultPill } from '@/components/ui/ResultPill'
import { formatPips } from '@/lib/utils'

interface TradeCalendarProps {
  trades: Trade[]
}

function getMonthDays(year: number, month: number) {
  const days: Date[] = []
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)

  let startDow = first.getDay()
  startDow = startDow === 0 ? 6 : startDow - 1

  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, -startDow + i + 1)
    days.push(d)
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i))
    }
  }
  return days
}

export function TradeCalendar({ trades }: TradeCalendarProps) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const days = getMonthDays(year, month)

  const tradesByDay: Record<string, Trade[]> = {}
  for (const trade of trades) {
    const d = new Date(trade.entryAt)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!tradesByDay[key]) tradesByDay[key] = []
    tradesByDay[key].push(trade)
  }

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div>
      <div
        style={{
          fontFamily: 'Kalam, cursive',
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: 16,
        }}
      >
        {monthName}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2,
          marginBottom: 2,
        }}
      >
        {dayHeaders.map((d) => (
          <div
            key={d}
            style={{
              padding: '4px 8px',
              textAlign: 'center',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 11,
              color: 'var(--ink-faint)',
              textTransform: 'uppercase',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2,
        }}
      >
        {days.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === month
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
          const dayTrades = tradesByDay[key] || []
          const isToday =
            day.getDate() === now.getDate() &&
            day.getMonth() === now.getMonth() &&
            day.getFullYear() === now.getFullYear()

          return (
            <div
              key={idx}
              style={{
                minHeight: 80,
                background: isCurrentMonth ? 'var(--surface)' : 'var(--bg-2)',
                border: `1px solid ${isToday ? 'var(--amber)' : 'var(--line)'}`,
                borderRadius: 6,
                padding: '6px 6px',
                opacity: isCurrentMonth ? 1 : 0.4,
              }}
            >
              <div
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 11,
                  color: isToday ? 'var(--amber)' : 'var(--ink-faint)',
                  marginBottom: 4,
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {day.getDate()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayTrades.map((trade) => (
                  <Link
                    key={trade.id}
                    href={`/journal/${trade.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        padding: '2px 4px',
                        borderRadius: 3,
                        background: trade.result === 'WIN'
                          ? 'var(--green)22'
                          : trade.result === 'LOSS'
                          ? 'var(--red)22'
                          : 'var(--surface-2)',
                        border: `1px solid ${
                          trade.result === 'WIN'
                            ? 'var(--green)44'
                            : trade.result === 'LOSS'
                            ? 'var(--red)44'
                            : 'var(--line)'
                        }`,
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: 10,
                        color: trade.result === 'WIN'
                          ? 'var(--green)'
                          : trade.result === 'LOSS'
                          ? 'var(--red)'
                          : 'var(--ink-dim)',
                      }}
                    >
                      {trade.direction} {formatPips(trade.pips)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
