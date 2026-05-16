'use client'

import { useState } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'

interface ChartScreenshotUploadProps {
  screenshotUrl?: string | null
  onUrlChange?: (url: string) => void
}

export function ChartScreenshotUpload({ screenshotUrl, onUrlChange }: ChartScreenshotUploadProps) {
  const [url, setUrl] = useState(screenshotUrl || '')
  const [editing, setEditing] = useState(false)

  function handleSave() {
    onUrlChange?.(url)
    setEditing(false)
  }

  if (screenshotUrl && !editing) {
    return (
      <div style={{ position: 'relative' }}>
        <img
          src={screenshotUrl}
          alt="Trade chart"
          style={{ width: '100%', borderRadius: 8, border: '1px solid var(--line)' }}
        />
        {onUrlChange && (
          <button
            onClick={() => setEditing(true)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 5,
              padding: '4px 8px',
              fontSize: 11,
              color: 'var(--ink-dim)',
              fontFamily: 'Kalam, cursive',
            }}
          >
            Change
          </button>
        )}
      </div>
    )
  }

  if (editing || !screenshotUrl) {
    return (
      <div
        style={{
          border: '1px solid var(--line)',
          borderRadius: 8,
          padding: 20,
          background: 'var(--surface-2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            marginBottom: onUrlChange ? 16 : 0,
          }}
        >
          <ImageIcon size={32} color="var(--ink-faint)" />
          <span style={{ fontSize: 13, color: 'var(--ink-dim)', fontFamily: 'Inter, sans-serif' }}>
            Chart Screenshot
          </span>
        </div>
        {onUrlChange && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              style={{ flex: 1, fontSize: 13 }}
            />
            <button
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: 13,
                fontFamily: 'Kalam, cursive',
              }}
            >
              <Upload size={12} />
              Save
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}
