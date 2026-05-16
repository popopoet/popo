'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', glyph: '◧' },
  { href: '/journal', label: 'Journal', glyph: '≡' },
  { href: '/weekly', label: 'Weekly Review', glyph: '▤' },
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
        padding: '18px 12px',
        gap: 4,
        flexShrink: 0,
      }}
    >
      <Link
        href="/dashboard"
        onClick={onClose}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--hand)',
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--ink)',
          padding: '6px 10px 16px',
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: 'var(--surface-2)',
            border: '1px solid var(--line-strong)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--amber)',
            fontWeight: 600,
          }}
        >
          XAU
        </span>
        Journal
      </Link>

      {navItems.map(({ href, label, glyph }) => {
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
              padding: '8px 10px',
              borderRadius: 6,
              fontFamily: 'var(--hand)',
              fontSize: 15,
              color: active ? 'var(--ink)' : 'var(--ink-dim)',
              background: active ? 'var(--surface-2)' : 'transparent',
              border: active ? '1px solid var(--line-strong)' : '1px solid transparent',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                border: '1px solid',
                borderColor: active ? 'var(--amber)' : 'var(--line-strong)',
                borderRadius: 4,
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'var(--mono)',
                fontSize: 9,
                color: active ? 'var(--amber)' : 'var(--ink-faint)',
              }}
            >
              {glyph}
            </span>
            {label}
          </Link>
        )
      })}

      <div style={{ flex: 1 }} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          borderTop: '1px solid var(--line)',
          marginTop: 8,
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--ink-faint)',
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: '1px solid var(--line-strong)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--hand)',
            color: 'var(--ink-dim)',
            fontSize: 13,
          }}
        >
          A
        </div>
        trader_01
      </div>
    </nav>
  )
}
