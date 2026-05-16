import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/ui/KpiCard'
import { BreakdownBars } from '@/components/ui/BreakdownBars'
import { AiInsightBlock } from '@/components/weekly/AiInsightBlock'
import { GradeBadge } from '@/components/ui/GradeBadge'
import { PrintButton } from '@/components/weekly/PrintButton'
import { prisma } from '@/lib/prisma'
import { getWeekRange, getISOWeek, formatPips } from '@/lib/utils'

interface RouteContext {
  params: Promise<{ week: string }>
}

function prevWeek(week: string): string {
  const { start } = getWeekRange(week)
  const prev = new Date(start)
  prev.setDate(prev.getDate() - 7)
  return getISOWeek(prev)
}

function nextWeek(week: string): string {
  const { start } = getWeekRange(week)
  const next = new Date(start)
  next.setDate(next.getDate() + 7)
  return getISOWeek(next)
}

function weekLabel(week: string): string {
  const [, wNum] = week.split('-W')
  return `Wk ${parseInt(wNum, 10)}`
}

const sessionShort: Record<string, string> = {
  LONDON: 'LDN',
  NEW_YORK: 'NY',
  ASIA: 'ASIA',
}

const dayShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default async function WeeklyReviewPage({ params }: RouteContext) {
  const { week } = await params
  const { start, end } = getWeekRange(week)

  const trades = await prisma.trade.findMany({
    where: { entryAt: { gte: start, lte: end } },
    orderBy: { entryAt: 'asc' },
  })

  const closed = trades.filter((t) => t.result !== 'OPEN')
  const wins = closed.filter((t) => t.result === 'WIN')
  const losses = closed.filter((t) => t.result === 'LOSS')
  const netPips = closed.reduce((s, t) => s + t.pips, 0)
  const winRate = closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : 0

  const bestPips = closed.reduce((m, t) => Math.max(m, t.pips), 0)
  const worstPips = closed.reduce((m, t) => Math.min(m, t.pips), 0)
  const avgR =
    closed.length > 0
      ? (closed.reduce((s, t) => s + t.rr, 0) / closed.length).toFixed(1)
      : '0'

  const sessionBars = [
    {
      label: 'London',
      value: closed.filter((t) => t.session === 'LONDON').reduce((s, t) => s + t.pips, 0),
    },
    {
      label: 'New York',
      value: closed
        .filter((t) => t.session === 'NEW_YORK')
        .reduce((s, t) => s + t.pips, 0),
    },
    {
      label: 'Asia',
      value: closed.filter((t) => t.session === 'ASIA').reduce((s, t) => s + t.pips, 0),
    },
  ]

  const prev = prevWeek(week)
  const next = nextWeek(week)
  const currentWeek = getISOWeek(new Date())
  const isCurrentOrFuture = week >= currentWeek

  const startDateStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endDateStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

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
            <h2 style={{ fontFamily: 'var(--hand)', fontSize: 24, fontWeight: 700 }}>
              Week {parseInt(week.split('-W')[1], 10)} — {startDateStr} → {endDateStr}
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
              {trades.length} trades · {wins.length}W / {losses.length}L · {formatPips(netPips)} pips
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href={`/weekly/${prev}`} className="pill">
              ‹ {weekLabel(prev)}
            </Link>
            <span className="pill active">{weekLabel(week)}</span>
            {!isCurrentOrFuture && (
              <Link href={`/weekly/${next}`} className="pill">
                {weekLabel(next)} ›
              </Link>
            )}
            <PrintButton />
          </div>
        </div>

        {/* KPI row */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}
          className="weekly-kpi-grid"
        >
          <KpiCard
            label="Net pips"
            value={formatPips(netPips)}
            valueColor={netPips >= 0 ? 'var(--green)' : 'var(--red)'}
          />
          <KpiCard label="Win rate" value={`${winRate}%`} sub={`${wins.length}/${closed.length}`} />
          <KpiCard
            label="Best trade"
            value={formatPips(bestPips)}
            valueColor="var(--green)"
          />
          <KpiCard
            label="Worst"
            value={formatPips(worstPips)}
            valueColor="var(--red)"
          />
          <KpiCard label="Avg R" value={`${avgR}R`} />
        </div>

        {/* Two col: trades table + session + AI */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          className="weekly-body"
        >
          <div className="box">
            <h4 style={{ fontFamily: 'var(--hand)', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
              Trades this week
            </h4>
            <table className="tj">
              <tbody>
                {trades.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
                      No trades yet this week
                    </td>
                  </tr>
                )}
                {trades.map((t) => {
                  const d = new Date(t.entryAt)
                  const dayName = dayShort[d.getDay()]
                  const time = d.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                  return (
                    <tr key={t.id}>
                      <td>
                        <Link
                          href={`/journal/${t.id}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {dayName} {time}
                        </Link>
                      </td>
                      <td className={t.direction === 'BUY' ? 'pos' : 'neg'} style={{ fontWeight: 600 }}>
                        {t.direction}
                      </td>
                      <td>{sessionShort[t.session]}</td>
                      <td>
                        <GradeBadge grade={t.grade} />
                      </td>
                      <td
                        className={t.pips >= 0 ? 'pos' : 'neg'}
                        style={{ textAlign: 'right', fontWeight: 500 }}
                      >
                        {formatPips(t.pips)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="box">
              <BreakdownBars title="Session split" items={sessionBars} />
            </div>
            <AiInsightBlock week={week} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .weekly-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .weekly-body { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppShell>
  )
}
