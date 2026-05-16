'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, BarChart2 } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/weekly', label: 'Weekly Review', icon: BarChart2 },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <nav
      style={{
        width: 200,
        minHeight: '100vh',
        background: 'var(--surface)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 0 24px 0',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--line)',
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              background: 'var(--amber)',
              color: '#0c0d10',
              borderRadius: 5,
              padding: '2px 7px',
              fontFamily: 'Kalam, cursive',
              fontWeight: 700,
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            XAU
          </div>
          <span
            style={{
              fontFamily: 'Kalam, cursive',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--ink)',
            }}
          >
            Journal
          </span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '4px 8px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 6,
                marginBottom: 2,
                fontFamily: 'Kalam, cursive',
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                color: active ? 'var(--amber)' : 'var(--ink-dim)',
                background: active ? 'var(--surface-2)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon size={16} color={active ? 'var(--amber)' : 'var(--ink-faint)'} />
              {label}
            </Link>
          )
        })}
      </div>

      <div
        style={{
          padding: '0 16px',
          fontSize: 11,
          color: 'var(--ink-faint)',
          fontFamily: 'IBM Plex Mono, monospace',
        }}
      >
        XAUUSD v1.0
      </div>
    </nav>
  )
}
