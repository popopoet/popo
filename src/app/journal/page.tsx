import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { TradeCard } from '@/components/trades/TradeCard'
import { TradeTable } from '@/components/trades/TradeTable'
import { TradeCalendar } from '@/components/trades/TradeCalendar'
import { prisma } from '@/lib/prisma'
import type { Grade, Result } from '@prisma/client'

type View = 'cards' | 'table' | 'calendar'
type FilterType = 'all' | Result | Grade

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; filter?: string }>
}) {
  const sp = await searchParams
  const view = (sp.view as View) || 'cards'
  const filter = (sp.filter || 'all') as FilterType

  const where: Record<string, unknown> = {}
  if (filter === 'WIN' || filter === 'LOSS' || filter === 'BREAKEVEN' || filter === 'OPEN') {
    where.result = filter
  } else if (filter === 'A_PLUS' || filter === 'A' || filter === 'B' || filter === 'C') {
    where.grade = filter
  }

  const trades = await prisma.trade.findMany({
    where,
    orderBy: { entryAt: 'desc' },
  })

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'WIN', label: 'Wins' },
    { value: 'LOSS', label: 'Losses' },
    { value: 'A_PLUS', label: 'A+' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
  ]

  const viewOptions: { value: View; label: string }[] = [
    { value: 'cards', label: 'Cards' },
    { value: 'table', label: 'Table' },
    { value: 'calendar', label: 'Calendar' },
  ]

  const viewLabel = viewOptions.find((v) => v.value === view)?.label ?? 'Cards'

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
            <h2 style={{ fontFamily: 'var(--hand)', fontWeight: 700, fontSize: 24 }}>Journal</h2>
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
              {viewLabel} view · {trades.length} trade{trades.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {viewOptions.map((opt) => (
              <Link
                key={opt.value}
                href={`/journal?view=${opt.value}&filter=${filter}`}
                className={`pill ${view === opt.value ? 'active' : ''}`}
              >
                {opt.label}
              </Link>
            ))}
            <Link href="/journal/new" className="btn primary">
              + New
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filterOptions.map((opt) => (
            <Link
              key={opt.value}
              href={`/journal?view=${view}&filter=${opt.value}`}
              className={`pill ${filter === opt.value ? 'active' : ''}`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {trades.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              border: '1px solid var(--line)',
              borderRadius: 8,
              background: 'var(--surface)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--hand)',
                fontSize: 16,
                color: 'var(--ink-dim)',
                marginBottom: 12,
              }}
            >
              No trades match this filter.
            </p>
            <Link href="/journal/new" className="btn primary">
              Log your first trade
            </Link>
          </div>
        )}

        {/* Cards view */}
        {trades.length > 0 && view === 'cards' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
            className="trade-card-grid"
          >
            {trades.map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        )}

        {/* Table view */}
        {trades.length > 0 && view === 'table' && (
          <div className="box" style={{ padding: 0, overflow: 'hidden' }}>
            <TradeTable trades={trades} />
          </div>
        )}

        {/* Calendar view */}
        {view === 'calendar' && (
          <div className="box">
            <TradeCalendar trades={trades} />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .trade-card-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .trade-card-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppShell>
  )
}
