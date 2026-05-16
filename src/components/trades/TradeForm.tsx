'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Direction, Session, Grade } from '@prisma/client'
import { ConfluenceChecklist } from './ConfluenceChecklist'
import type { ConfluenceData } from '@/lib/utils'
import { calcSession, calcGrade, calcRR, calcPips } from '@/lib/utils'

interface TradeFormData {
  direction: Direction
  entryPrice: string
  stopLoss: string
  takeProfit: string
  lots: string
  entryAt: string
  exitAt: string
  exitPrice: string
  session: Session
  notes: string
  screenshotUrl: string
  confluence: ConfluenceData
}

const defaultForm: TradeFormData = {
  direction: 'BUY',
  entryPrice: '',
  stopLoss: '',
  takeProfit: '',
  lots: '0.01',
  entryAt: new Date().toISOString().slice(0, 16),
  exitAt: '',
  exitPrice: '',
  session: 'LONDON',
  notes: '',
  screenshotUrl: '',
  confluence: {
    trendAlignment: false,
    keyLevel: false,
    candlePattern: false,
    riskReward: false,
  },
}

export function TradeForm() {
  const router = useRouter()
  const [form, setForm] = useState<TradeFormData>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key: Exclude<keyof TradeFormData, 'confluence'>, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'entryAt') {
        try {
          next.session = calcSession(new Date(value))
        } catch {}
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const entry = parseFloat(form.entryPrice)
    const sl = parseFloat(form.stopLoss)
    const tp = parseFloat(form.takeProfit)
    const exitP = form.exitPrice ? parseFloat(form.exitPrice) : undefined
    const grade = calcGrade(form.confluence)
    const rr = calcRR(entry, sl, tp)
    const pips = exitP ? calcPips(entry, exitP, form.direction) : 0
    const pl = 0

    let result: 'WIN' | 'LOSS' | 'BREAKEVEN' | 'OPEN' = 'OPEN'
    if (exitP !== undefined) {
      if (pips > 0) result = 'WIN'
      else if (pips < 0) result = 'LOSS'
      else result = 'BREAKEVEN'
    }

    const payload = {
      direction: form.direction,
      entryPrice: entry,
      stopLoss: sl,
      takeProfit: tp,
      lots: parseFloat(form.lots),
      entryAt: new Date(form.entryAt).toISOString(),
      exitAt: form.exitAt ? new Date(form.exitAt).toISOString() : undefined,
      exitPrice: exitP,
      session: form.session,
      notes: form.notes || undefined,
      screenshotUrl: form.screenshotUrl || undefined,
      confluence: form.confluence,
      grade,
      rr,
      pips,
      pl,
      result,
    }

    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to save trade')
      }
      const trade = await res.json()
      router.push(`/journal/${trade.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
      setSaving(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontFamily: 'IBM Plex Mono, monospace',
    color: 'var(--ink-faint)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 5,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 13,
  }

  const sectionStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            background: 'var(--red)22',
            border: '1px solid var(--red)44',
            borderRadius: 6,
            padding: '10px 14px',
            color: 'var(--red)',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <div style={sectionStyle}>
        <div
          style={{
            fontFamily: 'Kalam, cursive',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--ink-dim)',
            marginBottom: 16,
          }}
        >
          Trade Setup
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Direction</label>
            <select
              value={form.direction}
              onChange={(e) => set('direction', e.target.value)}
              style={inputStyle}
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Session</label>
            <select
              value={form.session}
              onChange={(e) => set('session', e.target.value)}
              style={inputStyle}
            >
              <option value="LONDON">London</option>
              <option value="NEW_YORK">New York</option>
              <option value="ASIA">Asia</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Entry Price</label>
            <input
              required
              type="number"
              step="0.01"
              value={form.entryPrice}
              onChange={(e) => set('entryPrice', e.target.value)}
              placeholder="2400.00"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Stop Loss</label>
            <input
              required
              type="number"
              step="0.01"
              value={form.stopLoss}
              onChange={(e) => set('stopLoss', e.target.value)}
              placeholder="2390.00"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Take Profit</label>
            <input
              required
              type="number"
              step="0.01"
              value={form.takeProfit}
              onChange={(e) => set('takeProfit', e.target.value)}
              placeholder="2420.00"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Lots</label>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={form.lots}
              onChange={(e) => set('lots', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Entry Time</label>
            <input
              required
              type="datetime-local"
              value={form.entryAt}
              onChange={(e) => set('entryAt', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div
          style={{
            fontFamily: 'Kalam, cursive',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--ink-dim)',
            marginBottom: 16,
          }}
        >
          Exit (optional)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Exit Price</label>
            <input
              type="number"
              step="0.01"
              value={form.exitPrice}
              onChange={(e) => set('exitPrice', e.target.value)}
              placeholder="2415.00"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Exit Time</label>
            <input
              type="datetime-local"
              value={form.exitAt}
              onChange={(e) => set('exitAt', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div
          style={{
            fontFamily: 'Kalam, cursive',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--ink-dim)',
            marginBottom: 16,
          }}
        >
          Confluence &amp; Notes
        </div>
        <div style={{ marginBottom: 16 }}>
          <ConfluenceChecklist
            confluence={form.confluence}
            onChange={(c) => setForm((prev) => ({ ...prev, confluence: c }))}
          />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            placeholder="Trade rationale, market context..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: '9px 18px',
            borderRadius: 6,
            border: '1px solid var(--line)',
            background: 'var(--surface-2)',
            color: 'var(--ink-dim)',
            fontFamily: 'Kalam, cursive',
            fontSize: 14,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '9px 18px',
            borderRadius: 6,
            border: '1px solid var(--amber)',
            background: 'var(--amber)',
            color: '#0c0d10',
            fontFamily: 'Kalam, cursive',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {saving ? 'Saving...' : 'Save Trade'}
        </button>
      </div>
    </form>
  )
}
