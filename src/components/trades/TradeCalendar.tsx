'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Trade } from '@prisma/client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPips, getISOWeek } from '@/lib/utils'
import { GradeBadge } from '@/components/ui/GradeBadge'

interface TradeCalendarProps {
  trades: Trade[]
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function TradeCalendar({ trades }: TradeCalendarProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOfWeek(new Date()))

  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const tradesByDay: Record<string, Trade[]> = {}
  for (const trade of trades) {
    const d = new Date(trade.entryAt)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!tradesByDay[key]) tradesByDay[key] = []
    tradesByDay[key].push(trade)
  }

  function shiftWeek(days: number) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + days)
    setWeekStart(d)
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const isoWeek = getISOWeek(weekStart)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h4 style={{ fontFamily: 'var(--hand)', fontSize: 16, fontWeight: 700 }}>
          Week of{' '}
          {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
          {weekDays[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h4>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={() => shiftWeek(-7)} className="pill" aria-label="Previous week">
            <ChevronLeft size={12} />
          </button>
          <span className="pill active">{isoWeek}</span>
          <button onClick={() => shiftWeek(7)} className="pill" aria-label="Next week">
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8,
          paddingBottom: 8,
          borderBottom: '1px solid var(--line)',
          marginBottom: 8,
        }}
      >
        {weekDays.map((d, i) => (
          <div
            key={i}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'var(--ink-faint)',
              textTransform: 'uppercase',
            }}
          >
            {dayNames[i]} · {d.getDate()}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8,
        }}
      >
        {weekDays.map((day, i) => {
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
          const dayTrades = tradesByDay[key] || []
          return (
            <div
              key={i}
              style={{
                minHeight: 110,
                border: '1px solid var(--line)',
                borderRadius: 6,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                background: 'var(--surface)',
              }}
            >
              {dayTrades.length === 0 && (
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    color: 'var(--ink-faint)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  —
                </span>
              )}
              {dayTrades.map((trade) => {
                const win = trade.result === 'WIN'
                const loss = trade.result === 'LOSS'
                const color = win ? 'var(--green)' : loss ? 'var(--red)' : 'var(--ink-dim)'
                return (
                  <Link
                    key={trade.id}
                    href={`/journal/${trade.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 7px',
                        borderRadius: 99,
                        border: `1px solid ${color}`,
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        color,
                      }}
                    >
                      <GradeBadge grade={trade.grade} />
                      <span>{formatPips(trade.pips)}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
