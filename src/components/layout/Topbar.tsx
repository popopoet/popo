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

  const matchedKey = Object.keys(crumbs).find((k) => pathname === k || pathname.startsWith(k + '/'))
  const breadcrumb = matchedKey ? crumbs[matchedKey] : ''

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        background: 'rgba(12, 13, 16, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onMenuClick}
          className="no-print"
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
        <span
          style={{
            fontFamily: 'Kalam, cursive',
            fontSize: 14,
            color: 'var(--ink-dim)',
          }}
        >
          {breadcrumb}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <DeployButton />
        <ThemeToggle />
      </div>

      <style>{`
        @media (max-width: 768px) {
          #menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
