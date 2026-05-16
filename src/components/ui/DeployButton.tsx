'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

type DeployState = 'idle' | 'deploying' | 'deployed' | 'undeploying' | 'syncing'

export function DeployButton() {
  const router = useRouter()
  const [state, setState] = useState<DeployState>('idle')
  const [message, setMessage] = useState('')

  async function handleDeploy() {
    setState('deploying')
    setMessage('')
    try {
      const res = await fetch('/api/metaapi/deploy', { method: 'POST' })
      if (!res.ok) throw new Error('Deploy failed')
      setState('deployed')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Deploy failed')
      setState('idle')
    }
  }

  async function handleUndeploy() {
    setState('undeploying')
    try {
      await fetch('/api/metaapi/undeploy', { method: 'POST' })
      setState('idle')
      setMessage('')
    } catch {
      setState('deployed')
    }
  }

  async function handleSync() {
    setState('syncing')
    setMessage('')
    try {
      const res = await fetch('/api/metaapi/sync', { method: 'POST' })
      const data = await res.json()
      setMessage(`Synced ${data.count ?? 0}`)
      setState('deployed')
      router.refresh()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Sync failed')
      setState('deployed')
    }
  }

  const baseBtn: React.CSSProperties = {
    fontFamily: 'var(--hand)',
    fontSize: 14,
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    background: 'var(--surface-2)',
    color: 'var(--ink)',
    border: '1px solid var(--line-strong)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  }

  const dotBase: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  }

  const isConnected = state === 'deployed' || state === 'syncing'

  if (isConnected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {message && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--ink-faint)',
              fontFamily: 'var(--mono)',
            }}
          >
            {message}
          </span>
        )}
        <button
          onClick={handleSync}
          disabled={state === 'syncing'}
          style={{
            ...baseBtn,
            color: 'var(--green)',
            borderColor: 'var(--green)',
          }}
          title="Sync new trades"
        >
          <span
            style={{
              ...dotBase,
              background: 'var(--green)',
              boxShadow: '0 0 0 3px rgba(121, 180, 135, 0.18)',
              animation: 'deploy-pulse 1.6s ease-in-out infinite',
            }}
          />
          {state === 'syncing' ? (
            <>
              <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> syncing
            </>
          ) : (
            <>sync</>
          )}
        </button>
        <button
          onClick={handleUndeploy}
          style={{ ...baseBtn, padding: '6px 10px', fontSize: 12 }}
          title="Disconnect MT5"
        >
          off
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {message && (
        <span style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--mono)' }}>
          {message}
        </span>
      )}
      <button
        onClick={handleDeploy}
        disabled={state === 'deploying'}
        style={baseBtn}
      >
        <span style={{ ...dotBase, background: 'var(--ink-faint)' }} />
        {state === 'deploying' ? (
          <>
            <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
            connecting
          </>
        ) : (
          'connect MT5'
        )}
      </button>
    </div>
  )
}
