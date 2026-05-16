'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import type { WeeklyInsight } from '@/lib/claude'

interface AiInsightBlockProps {
  week: string
  initialInsight?: WeeklyInsight | null
}

export function AiInsightBlock({ week, initialInsight }: AiInsightBlockProps) {
  const [insight, setInsight] = useState<WeeklyInsight | null>(initialInsight ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAnalyze() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/ai/weekly-insight/${week}`, { method: 'POST' })
      if (!res.ok) throw new Error('AI analysis failed')
      const data = await res.json()
      setInsight(data)
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
          Claude&apos;s pattern analysis
        </h4>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="pill"
          style={{ cursor: loading ? 'wait' : 'pointer' }}
        >
          <RefreshCw size={11} style={loading ? { animation: 'spin 0.8s linear infinite' } : {}} />
          {loading ? 'Analyzing' : insight ? 'Refresh' : 'Analyze'}
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 10 }}>{error}</p>
      )}

      {!insight && !loading && (
        <p style={{ color: 'var(--ink-faint)', fontSize: 13, padding: '8px 0' }}>
          Click <em>Analyze</em> to get Claude&apos;s read on what worked, what didn&apos;t, and
          the lesson for next week.
        </p>
      )}

      {insight && (
        <>
          <Section label="What worked" text={insight.what_worked} />
          <Section label="Repeating mistake" text={insight.repeating_mistake} />
          <Section label="Lesson" text={insight.lesson} />
        </>
      )}
    </div>
  )
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ padding: '10px 0', borderTop: '1px solid var(--line)' }}>
      <div className="label" style={{ marginBottom: 6 }}>
        {label}
      </div>
      <p style={{ margin: 0, color: 'var(--ink-dim)', fontSize: 13, lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  )
}
