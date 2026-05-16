import { AppShell } from '@/components/layout/AppShell'
import { TradeForm } from '@/components/trades/TradeForm'

export default function NewTradePage() {
  return (
    <AppShell>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: 'Kalam, cursive',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--ink)',
            marginBottom: 24,
          }}
        >
          New Trade
        </h1>
        <TradeForm />
      </div>
    </AppShell>
  )
}
