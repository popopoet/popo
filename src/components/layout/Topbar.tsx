'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { DeployButton } from '@/components/ui/DeployButton'

const crumbs: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/journal': 'Journal',
  '/weekly': 'Weekly Review',
}

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()

  const matchedKey = Object.keys(crumbs).find(
    (k) => pathname === k || pathname.startsWith(k + '/')
  )
  const breadcrumb = matchedKey ? crumbs[matchedKey] : ''

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '14px 24px',
        background: 'var(--topbar-bg)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--line)',
      }}
      className="no-print"
    >
      <button
        onClick={onMenuClick}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'var(--ink-dim)',
          padding: 4,
        }}
        id="menu-btn"
      >
        <Menu size={20} />
      </button>

      <div
        style={{
          fontFamily: 'var(--hand)',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '0.5px',
          color: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'var(--amber)',
            marginRight: 8,
          }}
        />
        XAUUSD Journal
      </div>

      {breadcrumb && (
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--ink-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          {breadcrumb}
        </div>
      )}

      <div style={{ flex: 1 }} />

      <DeployButton />
      <ThemeToggle />

      <style>{`
        @media (max-width: 768px) {
          #menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
