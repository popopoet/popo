import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/ui/KpiCard'
import { EquityCurveChart } from '@/components/ui/EquityCurveChart'
import { BreakdownBars } from '@/components/ui/BreakdownBars'
import { GradeBadge } from '@/components/ui/GradeBadge'
import { WithdrawalButton } from '@/components/ui/WithdrawalButton'
import { prisma } from '@/lib/prisma'
import { getAccountBalance } from '@/lib/metaapi'
import { formatPL, getISOWeek } from '@/lib/utils'
import type { Trade, Grade, Withdrawal } from '@prisma/client'
import React from 'react'

type Period = '30d' | '90d' | 'ytd' | 'all'

function getDateFrom(period: Period): Date | null {
  const now = new Date()
  if (period === '30d') { const d = new Date(now); d.setDate(d.getDate() - 30); return d }
  if (period === '90d') { const d = new Date(now); d.setDate(d.getDate() - 90); return d }
  if (period === 'ytd') return new Date(now.getFullYear(), 0, 1)
  return null
}

function buildBalanceCurve(
  trades: Trade[],
  withdrawals: Withdrawal[],
  startingBalance: number,
) {
  type Event = { ts: number; date: string; pl?: number; withdrawal?: number }
  const events: Event[] = []

  for (const t of trades) {
    const d = new Date(t.exitAt ?? t.entryAt)
    events.push({
      ts: d.getTime(),
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      pl: t.pl,
    })
  }
  for (const w of withdrawals) {
    const d = new Date(w.date)
    events.push({
      ts: d.getTime(),
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      withdrawal: w.amount,
    })
  }

  events.sort((a, b) => a.ts - b.ts)

  let balance = startingBalance
  return events.map((ev) => {
    if (ev.pl !== undefined) balance += ev.pl
    if (ev.withdrawal !== undefined) balance -= ev.withdrawal
    return {
      date: ev.date,
      balance: Math.round(balance * 100) / 100,
      withdrawal: ev.withdrawal,
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

  const [trades, allTrades, withdrawals, liveBalance] = await Promise.all([
    prisma.trade.findMany({
      where: from ? { entryAt: { gte: from } } : undefined,
      orderBy: { entryAt: 'asc' },
    }),
    prisma.trade.findMany({ select: { pl: true } }),
    prisma.withdrawal.findMany({ orderBy: { date: 'asc' } }),
    getAccountBalance().catch(() => null),
  ])

  const closed = trades.filter((t) => t.result !== 'OPEN')
  const wins = closed.filter((t) => t.result === 'WIN')
  const losses = closed.filter((t) => t.result === 'LOSS')
  const winRate = closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : 0
  const netPL = closed.reduce((s, t) => s + t.pl, 0)
  const netPips = closed.reduce((s, t) => s + t.pips, 0)

  const allTimePL = allTrades.reduce((s, t) => s + t.pl, 0)
  const totalWithdrawn = withdrawals.reduce((s, w) => s + w.amount, 0)

  const currentBalance = liveBalance?.balance ?? null
  const currency = liveBalance?.currency === 'USD' ? '$' : (liveBalance?.currency ?? '$')
  const startingBalance = currentBalance !== null
    ? currentBalance - allTimePL + totalWithdrawn
    : 0

  const periodWithdrawals = withdrawals.filter(
    (w) => !from || new Date(w.date) >= from,
  )
  const equityCurve = buildBalanceCurve(closed, periodWithdrawals, startingBalance)

  const sessionGroups: Record<string, number> = { LONDON: 0, NEW_YORK: 0, ASIA: 0 }
  for (const t of closed) sessionGroups[t.session] = (sessionGroups[t.session] || 0) + t.pips

  const gradeGroups: Record<Grade, number> = { A_PLUS: 0, A: 0, B: 0, C: 0 }
  for (const t of closed) gradeGroups[t.grade] = (gradeGroups[t.grade] || 0) + t.pips

  const sessionBars = [
    { label: 'London', value: sessionGroups.LONDON },
    { label: 'New York', value: sessionGroups.NEW_YORK },
    { label: 'Asia', value: sessionGroups.ASIA },
  ]

  const gradeBars: { label: React.ReactNode; value: number }[] = [
    { label: <GradeBadge grade="A_PLUS" />, value: gradeGroups.A_PLUS },
    { label: <GradeBadge grade="A" />, value: gradeGroups.A },
    { label: <GradeBadge grade="B" />, value: gradeGroups.B },
    { label: <GradeBadge grade="C" />, value: gradeGroups.C },
  ]

  const thisWeekCount = trades.filter(
    (t) => getISOWeek(new Date(t.entryAt)) === getISOWeek(new Date()),
  ).length

  const periods: { key: Period; label: string }[] = [
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: 'ytd', label: 'YTD' },
    { key: 'all', label: 'All' },
  ]

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Page head */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 16,
            paddingBottom: 12,
            borderBottom: '1px solid var(--line)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 style={{ fontFamily: 'var(--hand)', fontWeight: 700, fontSize: 26 }}>
              Hey, trader_01.
            </h2>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--ink-faint)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: 4,
              }}
            >
              {trades.length} trades · {wins.length}W · {losses.length}L · {periods.find((p) => p.key === period)?.label}
            </div>
          </div>

          {currentBalance !== null && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 24,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  letterSpacing: '-0.02em',
                }}
              >
                {currency}{currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                live balance
              </div>
            </div>
          )}
        </div>

        {/* Hero: equity curve + side stats */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12 }}
          className="dash-hero"
        >
          <div className="box">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h4 style={{ fontFamily: 'var(--hand)', fontSize: 15, fontWeight: 700 }}>
                  Balance curve
                </h4>
                <WithdrawalButton />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {periods.map((p) => (
                  <Link
                    key={p.key}
                    href={`/dashboard?period=${p.key}`}
                    className={`pill ${period === p.key ? 'active' : ''}`}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
            {equityCurve.length > 0 ? (
              <EquityCurveChart data={equityCurve} currency={currency} />
            ) : (
              <div
                style={{
                  height: 260,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--ink-faint)',
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  background: 'var(--bg-2)',
                }}
              >
                no trades yet
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="kpi">
              <span className="label">Net P/L</span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 34,
                  fontWeight: 500,
                  color: netPL >= 0 ? 'var(--green)' : 'var(--red)',
                  lineHeight: 1.1,
                }}
              >
                {formatPL(netPL)}
              </span>
              <span
                className="delta"
                style={{ color: netPips >= 0 ? 'var(--green)' : 'var(--red)' }}
              >
                {netPips >= 0 ? '+' : ''}{netPips.toFixed(1)} pips · {period === 'all' ? 'all time' : period.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <KpiCard label="Win Rate" value={`${winRate}%`} sub={`${wins.length}/${closed.length}`} />
              <KpiCard label="Trades" value={String(trades.length)} sub={`${closed.length} closed`} />
              <KpiCard
                label="Net P/L"
                value={formatPL(netPL)}
                valueColor={netPL >= 0 ? 'var(--green)' : 'var(--red)'}
              />
              <KpiCard label="This Week" value={String(thisWeekCount)} sub="trades" />
            </div>
          </div>
        </div>

        {/* Breakdowns */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          className="dash-breakdown"
        >
          <div className="box">
            <BreakdownBars title="By session" items={sessionBars} />
          </div>
          <div className="box">
            <BreakdownBars title="By setup grade" items={gradeBars} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dash-hero, .dash-breakdown { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppShell>
  )
}
