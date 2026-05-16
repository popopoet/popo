'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import type { TradeReview } from '@/lib/claude'

interface AiReviewBlockProps {
  tradeId: string
  initialReview?: TradeReview | null
}

export function AiReviewBlock({ tradeId, initialReview }: AiReviewBlockProps) {
  const [review, setReview] = useState<TradeReview | null>(initialReview ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAnalyze() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/ai/trade-review/${tradeId}`, { method: 'POST' })
      if (!res.ok) throw new Error('AI analysis failed')
      const data = await res.json()
      setReview(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        border: '1px solid var(--line-strong)',
        borderRadius: 8,
        background:
          'linear-gradient(180deg, rgba(125,155,194,0.07), transparent 60%), var(--surface)',
        padding: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <h4
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--hand)',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              border: '1px solid var(--blue)',
              color: 'var(--blue)',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 600,
            }}
          >
            AI
          </span>
          Claude&apos;s review
        </h4>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="pill"
          style={{ cursor: loading ? 'wait' : 'pointer' }}
        >
          <RefreshCw size={11} style={loading ? { animation: 'spin 0.8s linear infinite' } : {}} />
          {loading ? 'Analyzing' : review ? 'Re-analyze' : 'Analyze'}
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 10 }}>{error}</p>
      )}

      {!review && !loading && (
        <p
          style={{
            color: 'var(--ink-faint)',
            fontSize: 13,
            padding: '8px 0',
          }}
        >
          No review yet. Click <em>Analyze</em> for Claude&apos;s take on quality, sizing, and psychology.
        </p>
      )}

      {review && (
        <>
          <Section label="Quality" text={review.quality} />
          <Section label="Sizing" text={review.sizing} />
          <Section label="Psychology" text={review.psychology} />
        </>
      )}
    </div>
  )
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div
      style={{
        padding: '10px 0',
        borderTop: '1px solid var(--line)',
      }}
    >
      <div className="label" style={{ marginBottom: 6 }}>
        {label}
      </div>
      <p style={{ margin: 0, color: 'var(--ink-dim)', fontSize: 13, lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}
