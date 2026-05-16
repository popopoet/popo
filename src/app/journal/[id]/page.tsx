import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/ui/KpiCard'
import { GradeBadge } from '@/components/ui/GradeBadge'
import { DirectionLabel } from '@/components/ui/DirectionLabel'
import { AiReviewBlock } from '@/components/trades/AiReviewBlock'
import { ConfluenceChecklist } from '@/components/trades/ConfluenceChecklist'
import { ChartScreenshotUpload } from '@/components/trades/ChartScreenshotUpload'
import { prisma } from '@/lib/prisma'
import { formatPips, formatPL, formatPrice } from '@/lib/utils'
import type { TradeReview } from '@/lib/claude'
import type { ConfluenceData } from '@/lib/utils'
import { TradeDetailActions } from './TradeDetailActions'

interface RouteContext {
  params: Promise<{ id: string }>
}

const sessionLabel: Record<string, string> = {
  LONDON: 'London',
  NEW_YORK: 'New York',
  ASIA: 'Asia',
}

export default async function TradeDetailPage({ params }: RouteContext) {
  const { id } = await params

  const trade = await prisma.trade.findUnique({ where: { id } })
  if (!trade) notFound()

  const entryDate = new Date(trade.entryAt)
  const dateStr = entryDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const timeStr = entryDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const heldMs = trade.exitAt
    ? new Date(trade.exitAt).getTime() - entryDate.getTime()
    : null
  const heldStr = heldMs
    ? heldMs < 3600000
      ? `${Math.round(heldMs / 60000)}m`
      : `${Math.floor(heldMs / 3600000)}h ${Math.round((heldMs % 3600000) / 60000)}m`
    : 'Open'

  const aiReview = trade.aiReview as TradeReview | null
  const confluence = (trade.confluence as ConfluenceData) || {}
  const positive = trade.pips >= 0

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
              <DirectionLabel direction={trade.direction} size="md" /> XAUUSD ·{' '}
              <span style={{ color: 'var(--ink-dim)' }}>
                {dateStr} · {timeStr}
              </span>
            </h2>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--ink-faint)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: 4,
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <span>{sessionLabel[trade.session] || trade.session} session</span>
              <span>·</span>
              <span>#{trade.id.slice(-4)}</span>
              {trade.result !== 'OPEN' && (
                <>
                  <span>·</span>
                  <span
                    style={{
                      color: positive ? 'var(--green)' : 'var(--red)',
                      letterSpacing: 0,
                      textTransform: 'none',
                      fontSize: 12,
                    }}
                  >
                    {formatPips(trade.pips)} pips
                  </span>
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/journal" className="btn ghost">
              ‹ Back
            </Link>
            <Link href={`/journal/${trade.id}/edit`} className="btn">
              Edit
            </Link>
          </div>
        </div>

        {/* Two-column split */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '3fr 2fr',
            gap: 16,
          }}
          className="trade-detail-grid"
        >
          {/* Left: chart + KPIs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ChartScreenshotUpload screenshotUrl={trade.screenshotUrl} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <KpiCard label="Entry" value={formatPrice(trade.entryPrice)} />
              <KpiCard label="SL" value={formatPrice(trade.stopLoss)} />
              <KpiCard label="TP" value={formatPrice(trade.takeProfit)} />
              <KpiCard label="Lots" value={trade.lots.toFixed(2)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <KpiCard label="R:R" value={`1 : ${trade.rr.toFixed(1)}`} />
              <KpiCard
                label="Pips"
                value={formatPips(trade.pips)}
                valueColor={positive ? 'var(--green)' : 'var(--red)'}
              />
              <KpiCard
                label="P/L"
                value={formatPL(trade.pl)}
                valueColor={trade.pl >= 0 ? 'var(--green)' : 'var(--red)'}
              />
              <KpiCard label="Held" value={heldStr} />
            </div>

            {trade.notes && (
              <div className="box">
                <div className="label" style={{ marginBottom: 8 }}>
                  Notes
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--ink)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {trade.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right: checklist + AI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="box">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <h4 style={{ fontFamily: 'var(--hand)', fontSize: 15, fontWeight: 700 }}>
                  Setup grade
                </h4>
                <GradeBadge grade={trade.grade} size="md" />
              </div>
              <ConfluenceChecklist confluence={confluence} readonly />
            </div>

            <AiReviewBlock tradeId={trade.id} initialReview={aiReview} />

            <TradeDetailActions tradeId={trade.id} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .trade-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppShell>
  )
}
