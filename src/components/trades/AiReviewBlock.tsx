'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
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
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'Kalam, cursive',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--amber)',
          }}
        >
          <Sparkles size={15} />
          AI Review
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            borderRadius: 5,
            border: '1px solid var(--line)',
            background: 'var(--surface-2)',
            color: 'var(--ink-dim)',
            fontSize: 12,
            fontFamily: 'Kalam, cursive',
          }}
        >
          <RefreshCw size={11} style={loading ? { animation: 'spin 0.8s linear infinite' } : {}} />
          {loading ? 'Analyzing...' : review ? 'Re-analyze' : 'Analyze'}
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 10 }}>{error}</p>
      )}

      {!review && !loading && (
        <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
          Click &quot;Analyze&quot; to get AI feedback on this trade.
        </p>
      )}

      {review && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ReviewSection label="Trade Quality" text={review.quality} />
          <ReviewSection label="Position Sizing" text={review.sizing} />
          <ReviewSection label="Psychology" text={review.psychology} />
        </div>
      )}
    </div>
  )
}

function ReviewSection({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontFamily: 'IBM Plex Mono, monospace',
          color: 'var(--ink-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink)', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  )
}
