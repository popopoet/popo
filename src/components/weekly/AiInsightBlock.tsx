'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
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
          AI Pattern Analysis
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
          {loading ? 'Analyzing...' : insight ? 'Refresh' : 'Analyze Week'}
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 10 }}>{error}</p>
      )}

      {!insight && !loading && (
        <p
          style={{
            color: 'var(--ink-faint)',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Click &quot;Analyze Week&quot; to get AI insights on your weekly performance.
        </p>
      )}

      {insight && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InsightSection
            label="What Worked"
            text={insight.what_worked}
            color="var(--green)"
          />
          <InsightSection
            label="Repeating Mistake"
            text={insight.repeating_mistake}
            color="var(--red)"
          />
          <InsightSection
            label="Lesson for Next Week"
            text={insight.lesson}
            color="var(--amber)"
          />
        </div>
      )}
    </div>
  )
}

function InsightSection({
  label,
  text,
  color,
}: {
  label: string
  text: string
  color: string
}) {
  return (
    <div
      style={{
        paddingLeft: 10,
        borderLeft: `2px solid ${color}`,
      }}
    >
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
      <p
        style={{
          fontSize: 13,
          color: 'var(--ink)',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.6,
        }}
      >
        {text}
      </p>
    </div>
  )
}
