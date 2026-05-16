'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

type DeployState = 'idle' | 'checking' | 'deploying' | 'deployed' | 'undeploying' | 'syncing'

export function DeployButton() {
  const router = useRouter()
  const [state, setState] = useState<DeployState>('idle')
  const [message, setMessage] = useState('')

  async function handleConnect() {
    setState('checking')
    setMessage('')
    try {
      // Check account state first
      const statusRes = await fetch('/api/metaapi/status')
      const status = await statusRes.json()

      if (!status.ok) {
        // If not connected, try deploying
        setState('deploying')
        const deployRes = await fetch('/api/metaapi/deploy', { method: 'POST' })
        if (!deployRes.ok) {
          const d = await deployRes.json()
          throw new Error(d.error || 'Deploy failed')
        }
      }

      setState('deployed')
      setMessage(status.state?.state ?? 'connected')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Connect failed')
      setState('idle')
    }
  }

  async function handleUndeploy() {
    setState('undeploying')
    setMessage('')
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
      if (!res.ok) throw new Error(data.error || 'Sync failed')
      setMessage(`+${data.count ?? 0} trades`)
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
  const isBusy = state === 'checking' || state === 'deploying' || state === 'undeploying'

  if (isConnected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {message && (
          <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--mono)' }}>
            {message}
          </span>
        )}
        <button
          onClick={handleSync}
          disabled={state === 'syncing'}
          style={{ ...baseBtn, color: 'var(--green)', borderColor: 'var(--green)' }}
          title="Sync trades from MT5"
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
            <><RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> syncing</>
          ) : 'sync'}
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
        <span
          style={{
            fontSize: 11,
            color: 'var(--red)',
            fontFamily: 'var(--mono)',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={message}
        >
          {message}
        </span>
      )}
      <button
        onClick={handleConnect}
        disabled={isBusy}
        style={baseBtn}
      >
        <span style={{ ...dotBase, background: isBusy ? 'var(--amber)' : 'var(--ink-faint)' }} />
        {state === 'checking'
          ? <><RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> checking</>
          : state === 'deploying'
          ? <><RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> connecting</>
          : 'connect MT5'}
      </button>
    </div>
  )
}
