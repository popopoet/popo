import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/ui/KpiCard'
import { GradeBadge } from '@/components/ui/GradeBadge'
import { DirectionLabel } from '@/components/ui/DirectionLabel'
import { ResultPill } from '@/components/ui/ResultPill'
import { AiReviewBlock } from '@/components/trades/AiReviewBlock'
import { ConfluenceChecklist } from '@/components/trades/ConfluenceChecklist'
import { ChartScreenshotUpload } from '@/components/trades/ChartScreenshotUpload'
import { prisma } from '@/lib/prisma'
import { formatPips, formatPL, formatPrice } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import type { TradeReview } from '@/lib/claude'
import type { ConfluenceData } from '@/lib/utils'
import { TradeDetailActions } from './TradeDetailActions'

interface RouteContext {
  params: Promise<{ id: string }>
}

export default async function TradeDetailPage({ params }: RouteContext) {
  const { id } = await params

  const trade = await prisma.trade.findUnique({ where: { id } })
  if (!trade) notFound()

  const entryDate = new Date(trade.entryAt)
  const dateStr = entryDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const timeStr = entryDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  })

  const heldMs = trade.exitAt
    ? new Date(trade.exitAt).getTime() - entryDate.getTime()
    : null
  const heldStr = heldMs
    ? heldMs < 3600000
      ? `${Math.round(heldMs / 60000)}m`
      : `${(heldMs / 3600000).toFixed(1)}h`
    : 'Open'

  const aiReview = trade.aiReview as TradeReview | null
  const confluence = (trade.confluence as ConfluenceData) || {}

  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Link
            href="/journal"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--ink-dim)',
              fontFamily: 'Kalam, cursive',
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            <ChevronLeft size={16} />
            Journal
          </Link>
          <span style={{ color: 'var(--ink-faint)' }}>/</span>
          <span
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 12,
              color: 'var(--ink-faint)',
            }}
          >
            {trade.symbol}
          </span>
          <DirectionLabel direction={trade.direction} />
          <ResultPill result={trade.result} />
          <GradeBadge grade={trade.grade} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontFamily: 'Kalam, cursive',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--ink)',
              marginBottom: 2,
            }}
          >
            {trade.symbol} {trade.direction}
          </div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 12,
              color: 'var(--ink-dim)',
            }}
          >
            {dateStr} · {timeStr} · {trade.session}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
          }}
          className="trade-detail-grid"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ChartScreenshotUpload screenshotUrl={trade.screenshotUrl} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <KpiCard label="Entry" value={formatPrice(trade.entryPrice)} />
              <KpiCard label="Stop Loss" value={formatPrice(trade.stopLoss)} valueColor="var(--red)" />
              <KpiCard label="Take Profit" value={formatPrice(trade.takeProfit)} valueColor="var(--green)" />
              <KpiCard label="Lots" value={trade.lots.toFixed(2)} />
              <KpiCard
                label="Risk/Reward"
                value={`${trade.rr.toFixed(1)}R`}
              />
              <KpiCard
                label="Pips"
                value={formatPips(trade.pips)}
                valueColor={trade.pips >= 0 ? 'var(--green)' : 'var(--red)'}
              />
              <KpiCard
                label="P/L"
                value={formatPL(trade.pl)}
                valueColor={trade.pl >= 0 ? 'var(--green)' : 'var(--red)'}
              />
              <KpiCard label="Held" value={heldStr} />
            </div>

            {trade.notes && (
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: 'IBM Plex Mono, monospace',
                    color: 'var(--ink-faint)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 8,
                  }}
                >
                  Notes
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--ink)',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {trade.notes}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontFamily: 'Kalam, cursive',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  Setup Grade
                </div>
                <GradeBadge grade={trade.grade} />
              </div>
              <ConfluenceChecklist confluence={confluence} readonly />
            </div>

            <AiReviewBlock tradeId={trade.id} initialReview={aiReview} />

            <TradeDetailActions tradeId={trade.id} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .trade-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AppShell>
  )
}
