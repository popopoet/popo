'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

type Theme = 'dark' | 'light' | 'system'

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.body.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('xauj.theme') || 'dark';
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = theme === 'dark' || (theme === 'system' && prefersDark);
        document.body ? document.body.setAttribute('data-theme', isDark ? 'dark' : 'light') :
          document.addEventListener('DOMContentLoaded', function() {
            document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
          });
      } catch(e) {}
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

  const icons: Record<Theme, React.ReactNode> = {
    dark: <Moon size={14} />,
    light: <Sun size={14} />,
    system: <Monitor size={14} />,
  }
  const next: Record<Theme, Theme> = { dark: 'light', light: 'system', system: 'dark' }

  return (
    <button
      onClick={() => handleChange(next[theme])}
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--line)',
        borderRadius: 6,
        padding: '6px 10px',
        color: 'var(--ink-dim)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontFamily: 'IBM Plex Mono, monospace',
      }}
      title={`Theme: ${theme}`}
    >
      {icons[theme]}
      <span style={{ textTransform: 'capitalize' }}>{theme}</span>
    </button>
  )
}
