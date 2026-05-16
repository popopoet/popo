import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/ui/KpiCard'
import { BreakdownBars } from '@/components/ui/BreakdownBars'
import { AiInsightBlock } from '@/components/weekly/AiInsightBlock'
import { DirectionLabel } from '@/components/ui/DirectionLabel'
import { ResultPill } from '@/components/ui/ResultPill'
import { prisma } from '@/lib/prisma'
import { getWeekRange, getISOWeek, formatPips, formatPL, formatPrice } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react'

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
  const winRate = closed.length > 0 ? ((wins.length / closed.length) * 100).toFixed(0) : '0'

  const bestTrade = closed.reduce(
    (best, t) => (!best || t.pips > best.pips ? t : best),
    null as (typeof closed)[0] | null
  )
  const worstTrade = closed.reduce(
    (worst, t) => (!worst || t.pips < worst.pips ? t : worst),
    null as (typeof closed)[0] | null
  )

  const avgR =
    closed.length > 0
      ? (closed.reduce((s, t) => s + t.rr, 0) / closed.length).toFixed(1)
      : '0'

  const sessionBars = ['LONDON', 'NEW_YORK', 'ASIA'].map((s) => ({
    label: s === 'NEW_YORK' ? 'New York' : s === 'LONDON' ? 'London' : 'Asia',
    value: closed.filter((t) => t.session === s).reduce((sum, t) => sum + t.pips, 0),
  }))

  const prev = prevWeek(week)
  const next = nextWeek(week)
  const currentWeek = getISOWeek(new Date())
  const isCurrentOrFuture = week >= currentWeek

  const startDateStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const endDateStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href={`/weekly/${prev}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--ink-dim)',
                textDecoration: 'none',
              }}
            >
              <ChevronLeft size={16} />
            </Link>
            <div>
              <h1
                style={{
                  fontFamily: 'Kalam, cursive',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--ink)',
                }}
              >
                {weekLabel(week)}
              </h1>
              <div
                style={{
                  fontSize: 12,
                  fontFamily: 'IBM Plex Mono, monospace',
                  color: 'var(--ink-dim)',
                }}
              >
                {startDateStr} – {endDateStr}
              </div>
            </div>
            {!isCurrentOrFuture && (
              <Link
                href={`/weekly/${next}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderRadius: 5,
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink-dim)',
                  textDecoration: 'none',
                }}
              >
                <ChevronRight size={16} />
              </Link>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="no-print"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 6,
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              color: 'var(--ink-dim)',
              fontFamily: 'Kalam, cursive',
              fontSize: 13,
            }}
          >
            <Printer size={13} />
            Export PDF
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
            marginBottom: 20,
          }}
          className="weekly-kpi-grid"
        >
          <KpiCard
            label="Net Pips"
            value={formatPips(netPips)}
            valueColor={netPips >= 0 ? 'var(--green)' : 'var(--red)'}
          />
          <KpiCard
            label="Win Rate"
            value={`${winRate}%`}
            sub={`${wins.length}W / ${losses.length}L`}
          />
          <KpiCard
            label="Best Trade"
            value={bestTrade ? formatPips(bestTrade.pips) : 'N/A'}
            valueColor="var(--green)"
          />
          <KpiCard
            label="Worst Trade"
            value={worstTrade ? formatPips(worstTrade.pips) : 'N/A'}
            valueColor="var(--red)"
          />
          <KpiCard label="Avg R" value={`${avgR}R`} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
          className="weekly-main-grid"
        >
          <div>
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--line)',
                  fontFamily: 'Kalam, cursive',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--ink-dim)',
                }}
              >
                Trades ({closed.length})
              </div>
              {closed.length === 0 ? (
                <div
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: 'var(--ink-faint)',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 13,
                  }}
                >
                  No trades this week
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--line)' }}>
                        {['Day', 'Dir', 'Pips', 'P/L', 'RR'].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '6px 12px',
                              fontFamily: 'IBM Plex Mono, monospace',
                              fontSize: 10,
                              color: 'var(--ink-faint)',
                              textAlign: 'left',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                        <th style={{ padding: '6px 12px' }} />
                      </tr>
                    </thead>
                    <tbody>
                      {closed.map((trade) => {
                        const d = new Date(trade.entryAt)
                        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                        return (
                          <tr key={trade.id} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td
                              style={{
                                padding: '8px 12px',
                                fontFamily: 'IBM Plex Mono, monospace',
                                fontSize: 11,
                                color: 'var(--ink-dim)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {dayStr}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <DirectionLabel direction={trade.direction} />
                            </td>
                            <td
                              style={{
                                padding: '8px 12px',
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
                                padding: '8px 12px',
                                fontFamily: 'IBM Plex Mono, monospace',
                                fontSize: 12,
                                color: trade.pl >= 0 ? 'var(--green)' : 'var(--red)',
                              }}
                            >
                              {formatPL(trade.pl)}
                            </td>
                            <td
                              style={{
                                padding: '8px 12px',
                                fontFamily: 'IBM Plex Mono, monospace',
                                fontSize: 12,
                                color: 'var(--ink-dim)',
                              }}
                            >
                              {trade.rr.toFixed(1)}R
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <ResultPill result={trade.result} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

            <AiInsightBlock week={week} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .weekly-kpi-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .weekly-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .weekly-kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </AppShell>
  )
}
