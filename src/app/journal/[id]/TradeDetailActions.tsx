'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'

export function TradeDetailActions({ tradeId }: { tradeId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this trade? This cannot be undone.')) return
    setDeleting(true)
    try {
      await fetch(`/api/trades/${tradeId}`, { method: 'DELETE' })
      router.push('/journal')
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <Link
        href={`/journal/${tradeId}/edit`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '7px 14px',
          borderRadius: 6,
          border: '1px solid var(--line)',
          background: 'var(--surface-2)',
          color: 'var(--ink-dim)',
          fontFamily: 'Kalam, cursive',
          fontSize: 13,
          textDecoration: 'none',
        }}
      >
        <Pencil size={12} />
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '7px 14px',
          borderRadius: 6,
          border: '1px solid var(--red)44',
          background: 'var(--red)11',
          color: 'var(--red)',
          fontFamily: 'Kalam, cursive',
          fontSize: 13,
        }}
      >
        <Trash2 size={12} />
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
}
