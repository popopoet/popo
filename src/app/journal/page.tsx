import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { TradeCard } from '@/components/trades/TradeCard'
import { TradeTable } from '@/components/trades/TradeTable'
import { TradeCalendar } from '@/components/trades/TradeCalendar'
import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'
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

  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <h1
            style={{
              fontFamily: 'Kalam, cursive',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--ink)',
            }}
          >
            Journal
          </h1>

          <Link
            href="/journal/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 6,
              background: 'var(--amber)',
              color: '#0c0d10',
              fontFamily: 'Kalam, cursive',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <Plus size={15} />
            New Trade
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {filterOptions.map((opt) => (
              <Link
                key={opt.value}
                href={`/journal?view=${view}&filter=${opt.value}`}
                style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontFamily: 'Kalam, cursive',
                  fontSize: 13,
                  border: '1px solid var(--line)',
                  background: filter === opt.value ? 'var(--surface-2)' : 'transparent',
                  color: filter === opt.value ? 'var(--amber)' : 'var(--ink-dim)',
                  textDecoration: 'none',
                  fontWeight: filter === opt.value ? 700 : 400,
                }}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 2,
              border: '1px solid var(--line)',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {viewOptions.map((opt) => (
              <Link
                key={opt.value}
                href={`/journal?view=${opt.value}&filter=${filter}`}
                style={{
                  padding: '5px 12px',
                  fontFamily: 'Kalam, cursive',
                  fontSize: 12,
                  background: view === opt.value ? 'var(--surface-2)' : 'transparent',
                  color: view === opt.value ? 'var(--ink)' : 'var(--ink-faint)',
                  textDecoration: 'none',
                }}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {trades.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--ink-faint)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
            }}
          >
            <p style={{ marginBottom: 12 }}>No trades found.</p>
            <Link
              href="/journal/new"
              style={{
                color: 'var(--amber)',
                textDecoration: 'none',
                fontFamily: 'Kalam, cursive',
                fontSize: 15,
              }}
            >
              Log your first trade →
            </Link>
          </div>
        )}

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

        {trades.length > 0 && view === 'table' && (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <TradeTable trades={trades} />
          </div>
        )}

        {view === 'calendar' && (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: 20,
            }}
          >
            <TradeCalendar trades={trades} />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .trade-card-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .trade-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AppShell>
  )
}
