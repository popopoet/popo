'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function WithdrawalButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), date, note }),
    })
    setSaving(false)
    setOpen(false)
    setAmount('')
    setNote('')
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: 'var(--hand)',
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 6,
          cursor: 'pointer',
          background: 'transparent',
          color: 'var(--red)',
          border: '1px solid var(--red)',
          opacity: 0.7,
        }}
      >
        + withdraw
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
    >
      <input
        type="number"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 12,
          padding: '4px 8px',
          borderRadius: 5,
          border: '1px solid var(--line-strong)',
          background: 'var(--surface)',
          color: 'var(--ink)',
          width: 90,
        }}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 12,
          padding: '4px 8px',
          borderRadius: 5,
          border: '1px solid var(--line-strong)',
          background: 'var(--surface)',
          color: 'var(--ink)',
        }}
      />
      <input
        type="text"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 12,
          padding: '4px 8px',
          borderRadius: 5,
          border: '1px solid var(--line-strong)',
          background: 'var(--surface)',
          color: 'var(--ink)',
          width: 110,
        }}
      />
      <button
        type="submit"
        disabled={saving}
        style={{
          fontFamily: 'var(--hand)',
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 5,
          border: '1px solid var(--red)',
          background: 'var(--red)',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {saving ? '…' : 'Save'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        style={{
          fontFamily: 'var(--hand)',
          fontSize: 12,
          padding: '4px 8px',
          borderRadius: 5,
          border: '1px solid var(--line)',
          background: 'transparent',
          color: 'var(--ink-dim)',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </form>
  )
}
