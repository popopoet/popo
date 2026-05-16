import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/ui/KpiCard'
import { EquityCurveChart } from '@/components/ui/EquityCurveChart'
import { BreakdownBars } from '@/components/ui/BreakdownBars'
import { prisma } from '@/lib/prisma'
import { formatPips, formatPL, getISOWeek } from '@/lib/utils'
import type { Trade } from '@prisma/client'

type Period = '30d' | '90d' | 'ytd' | 'all'

function getDateFrom(period: Period): Date | null {
  const now = new Date()
  if (period === '30d') {
    const d = new Date(now)
    d.setDate(d.getDate() - 30)
    return d
  }
  if (period === '90d') {
    const d = new Date(now)
    d.setDate(d.getDate() - 90)
    return d
  }
  if (period === 'ytd') {
    return new Date(now.getFullYear(), 0, 1)
  }
  return null
}

function buildEquityCurve(trades: Trade[]) {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.entryAt).getTime() - new Date(b.entryAt).getTime()
  )
  let cumPips = 0
  return sorted.map((t) => {
    cumPips += t.pips
    const d = new Date(t.entryAt)
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      equity: Math.round(cumPips * 10) / 10,
    }
  })
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const sp = await searchParams
  const period = (sp.period as Period) || '30d'
  const from = getDateFrom(period)

  const trades = await prisma.trade.findMany({
    where: from ? { entryAt: { gte: from } } : undefined,
    orderBy: { entryAt: 'asc' },
  })

  const closed = trades.filter((t) => t.result !== 'OPEN')
  const wins = closed.filter((t) => t.result === 'WIN')
  const winRate = closed.length > 0 ? ((wins.length / closed.length) * 100).toFixed(0) : '0'
  const netPips = closed.reduce((s, t) => s + t.pips, 0)
  const netPL = closed.reduce((s, t) => s + t.pl, 0)

  const equityCurve = buildEquityCurve(closed)

  const sessionGroups: Record<string, number> = { LONDON: 0, NEW_YORK: 0, ASIA: 0 }
  for (const t of closed) sessionGroups[t.session] = (sessionGroups[t.session] || 0) + t.pips

  const gradeGroups: Record<string, number> = { A_PLUS: 0, A: 0, B: 0, C: 0 }
  for (const t of closed) gradeGroups[t.grade] = (gradeGroups[t.grade] || 0) + t.pips

  const sessionBars = [
    { label: 'London', value: sessionGroups.LONDON },
    { label: 'New York', value: sessionGroups.NEW_YORK },
    { label: 'Asia', value: sessionGroups.ASIA },
  ]

  const gradeBars = [
    { label: 'A+', value: gradeGroups.A_PLUS, color: 'var(--green)' },
    { label: 'A', value: gradeGroups.A, color: 'var(--blue)' },
    { label: 'B', value: gradeGroups.B, color: 'var(--amber)' },
    { label: 'C', value: gradeGroups.C, color: 'var(--ink-faint)' },
  ]

  const periods: Period[] = ['30d', '90d', 'ytd', 'all']
  const periodLabels: Record<Period, string> = {
    '30d': '30D',
    '90d': '90D',
    ytd: 'YTD',
    all: 'All',
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'Kalam, cursive',
                fontSize: 28,
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: 4,
              }}
            >
              Hey, trader.
            </h1>
            <p style={{ color: 'var(--ink-dim)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
              {trades.length} trade{trades.length !== 1 ? 's' : ''} tracked
              {closed.length > 0 && ` · ${wins.length} wins`}
              {closed.length > 0 && ` · ${winRate}% win rate`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {periods.map((p) => (
              <Link
                key={p}
                href={`/dashboard?period=${p}`}
                style={{
                  padding: '5px 12px',
                  borderRadius: 5,
                  fontFamily: 'Kalam, cursive',
                  fontSize: 13,
                  border: '1px solid var(--line)',
                  background: period === p ? 'var(--amber)' : 'var(--surface)',
                  color: period === p ? '#0c0d10' : 'var(--ink-dim)',
                  textDecoration: 'none',
                  fontWeight: period === p ? 700 : 400,
                }}
              >
                {periodLabels[p]}
              </Link>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 16,
            marginBottom: 16,
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: 'IBM Plex Mono, monospace',
                color: 'var(--ink-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 16,
              }}
            >
              Cumulative Pips
            </div>
            <EquityCurveChart data={equityCurve} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontFamily: 'IBM Plex Mono, monospace',
                  color: 'var(--ink-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                }}
              >
                Net P/L
              </div>
              <div
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 32,
                  fontWeight: 600,
                  color: netPL >= 0 ? 'var(--green)' : 'var(--red)',
                  lineHeight: 1.1,
                }}
              >
                {formatPL(netPL)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--ink-dim)',
                  fontFamily: 'IBM Plex Mono, monospace',
                  marginTop: 4,
                }}
              >
                {formatPips(netPips)} pips
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              <KpiCard label="Win Rate" value={`${winRate}%`} sub={`${wins.length}/${closed.length}`} />
              <KpiCard label="Trades" value={String(trades.length)} sub={`${closed.length} closed`} />
              <KpiCard
                label="Net Pips"
                value={formatPips(netPips)}
                valueColor={netPips >= 0 ? 'var(--green)' : 'var(--red)'}
              />
              <KpiCard
                label="This Week"
                value={String(
                  trades.filter((t) => getISOWeek(new Date(t.entryAt)) === getISOWeek(new Date())).length
                )}
                sub="trades"
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: 20,
            }}
          >
            <BreakdownBars title="By Session" items={sessionBars} />
          </div>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: 20,
            }}
          >
            <BreakdownBars title="By Grade" items={gradeBars} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
