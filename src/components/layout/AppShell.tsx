'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="sidebar-desktop">
        <Sidebar />
      </div>

      {drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
              background: 'rgba(0,0,0,0.5)',
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 100,
              height: '100vh',
            }}
          >
            <Sidebar onClose={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar onMenuClick={() => setDrawerOpen(true)} />
        <main
          style={{
            flex: 1,
            padding: '24px 28px 80px',
            maxWidth: 1480,
            margin: '0 auto',
            width: '100%',
          }}
        >
          {children}
        </main>
      </div>

      <style>{`
        .sidebar-desktop { display: flex; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
        }
      `}</style>
    </div>
  )
}
