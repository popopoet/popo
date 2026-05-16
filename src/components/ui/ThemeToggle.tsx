'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

type Theme = 'dark' | 'light' | 'system'

function applyTheme(theme: Theme) {
  document.body.setAttribute('data-theme', theme)
}

export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('xauj.theme') || 'dark';
        document.body
          ? document.body.setAttribute('data-theme', theme)
          : document.addEventListener('DOMContentLoaded', function () {
              document.body.setAttribute('data-theme', theme);
            });
      } catch (e) {}
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = (localStorage.getItem('xauj.theme') as Theme) || 'dark'
    setTheme(stored)
  }, [])

  function handleChange(next: Theme) {
    setTheme(next)
    localStorage.setItem('xauj.theme', next)
    applyTheme(next)
  }

  const options: { key: Theme; icon: React.ReactNode; label: string }[] = [
    { key: 'light', icon: <Sun size={12} />, label: 'Light' },
    { key: 'dark', icon: <Moon size={12} />, label: 'Dark' },
    { key: 'system', icon: <Monitor size={12} />, label: 'Auto' },
  ]

  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        padding: 3,
        border: '1px solid var(--line)',
        borderRadius: 8,
        background: 'var(--surface)',
      }}
      role="tablist"
      aria-label="Theme"
    >
      {options.map((opt) => {
        const active = theme === opt.key
        return (
          <button
            key={opt.key}
            onClick={() => handleChange(opt.key)}
            title={opt.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 5,
              border: 'none',
              background: active ? 'var(--surface-2)' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--ink-faint)',
              fontFamily: 'var(--hand)',
              fontSize: 12,
            }}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
