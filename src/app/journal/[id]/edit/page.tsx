'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { ConfluenceChecklist } from '@/components/trades/ConfluenceChecklist'
import type { ConfluenceData } from '@/lib/utils'
import { calcSession, calcGrade, calcRR, calcPips } from '@/lib/utils'
import type { Direction, Session } from '@prisma/client'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

interface EditTradeFormData {
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

export default function EditTradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [form, setForm] = useState<EditTradeFormData | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/trades/${id}`)
      .then((r) => r.json())
      .then((trade) => {
        setForm({
          direction: trade.direction,
          entryPrice: String(trade.entryPrice),
          stopLoss: String(trade.stopLoss),
          takeProfit: String(trade.takeProfit),
          lots: String(trade.lots),
          entryAt: new Date(trade.entryAt).toISOString().slice(0, 16),
          exitAt: trade.exitAt ? new Date(trade.exitAt).toISOString().slice(0, 16) : '',
          exitPrice: trade.exitPrice != null ? String(trade.exitPrice) : '',
          session: trade.session,
          notes: trade.notes || '',
          screenshotUrl: trade.screenshotUrl || '',
          confluence: (trade.confluence as ConfluenceData) || {},
        })
      })
      .catch(() => setError('Failed to load trade'))
  }, [id])

  function set(key: keyof EditTradeFormData, value: string | ConfluenceData) {
    setForm((prev) => {
      if (!prev) return prev
      const next = { ...prev, [key]: value }
      if (key === 'entryAt') {
        try {
          next.session = calcSession(new Date(value as string))
        } catch {}
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setError('')

    const entry = parseFloat(form.entryPrice)
    const sl = parseFloat(form.stopLoss)
    const tp = parseFloat(form.takeProfit)
    const exitP = form.exitPrice ? parseFloat(form.exitPrice) : undefined
    const grade = calcGrade(form.confluence)
    const rr = calcRR(entry, sl, tp)
    const pips = exitP ? calcPips(entry, exitP, form.direction) : 0

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
      exitAt: form.exitAt ? new Date(form.exitAt).toISOString() : null,
      exitPrice: exitP ?? null,
      session: form.session,
      notes: form.notes || null,
      screenshotUrl: form.screenshotUrl || null,
      confluence: form.confluence,
      grade,
      rr,
      pips,
      result,
    }

    try {
      const res = await fetch(`/api/trades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to save trade')
      }
      router.push(`/journal/${id}`)
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
    <AppShell>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Link
            href={`/journal/${id}`}
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
            Back
          </Link>
          <h1
            style={{
              fontFamily: 'Kalam, cursive',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--ink)',
            }}
          >
            Edit Trade
          </h1>
        </div>

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

        {!form && !error && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-faint)', fontFamily: 'IBM Plex Mono' }}>
            Loading...
          </div>
        )}

        {form && (
          <form onSubmit={handleSubmit}>
            <div style={sectionStyle}>
              <div style={{ fontFamily: 'Kalam, cursive', fontSize: 14, fontWeight: 700, color: 'var(--ink-dim)', marginBottom: 16 }}>
                Trade Setup
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Direction</label>
                  <select value={form.direction} onChange={(e) => set('direction', e.target.value)} style={inputStyle}>
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Session</label>
                  <select value={form.session} onChange={(e) => set('session', e.target.value)} style={inputStyle}>
                    <option value="LONDON">London</option>
                    <option value="NEW_YORK">New York</option>
                    <option value="ASIA">Asia</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Entry Price</label>
                  <input required type="number" step="0.01" value={form.entryPrice} onChange={(e) => set('entryPrice', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Stop Loss</label>
                  <input required type="number" step="0.01" value={form.stopLoss} onChange={(e) => set('stopLoss', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Take Profit</label>
                  <input required type="number" step="0.01" value={form.takeProfit} onChange={(e) => set('takeProfit', e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Lots</label>
                  <input required type="number" step="0.01" min="0.01" value={form.lots} onChange={(e) => set('lots', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Entry Time</label>
                  <input required type="datetime-local" value={form.entryAt} onChange={(e) => set('entryAt', e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <div style={{ fontFamily: 'Kalam, cursive', fontSize: 14, fontWeight: 700, color: 'var(--ink-dim)', marginBottom: 16 }}>
                Exit
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Exit Price</label>
                  <input type="number" step="0.01" value={form.exitPrice} onChange={(e) => set('exitPrice', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Exit Time</label>
                  <input type="datetime-local" value={form.exitAt} onChange={(e) => set('exitAt', e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <div style={{ fontFamily: 'Kalam, cursive', fontSize: 14, fontWeight: 700, color: 'var(--ink-dim)', marginBottom: 16 }}>
                Confluence &amp; Notes
              </div>
              <div style={{ marginBottom: 16 }}>
                <ConfluenceChecklist
                  confluence={form.confluence}
                  onChange={(c) => setForm((prev) => prev ? { ...prev, confluence: c } : prev)}
                />
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Link
                href={`/journal/${id}`}
                style={{
                  padding: '9px 18px',
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  background: 'var(--surface-2)',
                  color: 'var(--ink-dim)',
                  fontFamily: 'Kalam, cursive',
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                Cancel
              </Link>
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
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  )
}
