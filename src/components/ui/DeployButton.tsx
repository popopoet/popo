'use client'

import { useState } from 'react'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'

type DeployState = 'idle' | 'deploying' | 'deployed' | 'undeploying' | 'syncing'

export function DeployButton() {
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
      setMessage(`Synced ${data.count ?? 0} trades`)
      setState('deployed')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Sync failed')
      setState('deployed')
    }
  }

  const dotStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  }

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'Kalam, cursive',
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--ink)',
  }

  if (state === 'deployed' || state === 'syncing') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {message && (
          <span style={{ fontSize: 12, color: 'var(--ink-dim)', fontFamily: 'IBM Plex Mono' }}>
            {message}
          </span>
        )}
        <button
          onClick={handleSync}
          disabled={state === 'syncing'}
          style={{ ...btnBase, color: 'var(--green)', borderColor: 'var(--green)' }}
        >
          <span
            style={{ ...dotStyle, background: 'var(--green)', animation: 'pulse-dot 1.5s ease-in-out infinite' }}
          />
          {state === 'syncing' ? (
            <>
              <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
              Syncing...
            </>
          ) : (
            <>
              <Wifi size={12} />
              Sync
            </>
          )}
        </button>
        <button
          onClick={handleUndeploy}
          style={{ ...btnBase, fontSize: 11, padding: '4px 8px' }}
          title="Disconnect"
        >
          <WifiOff size={11} />
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {message && (
        <span style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'IBM Plex Mono' }}>
          {message}
        </span>
      )}
      <button
        onClick={handleDeploy}
        disabled={state === 'deploying'}
        style={btnBase}
      >
        {state === 'deploying' ? (
          <>
            <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
            Connecting...
          </>
        ) : (
          <>
            <span style={{ ...dotStyle, background: 'var(--ink-faint)' }} />
            Connect MT5
          </>
        )}
      </button>
    </div>
  )
}
