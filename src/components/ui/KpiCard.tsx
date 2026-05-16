interface KpiCardProps {
  label: string
  value: string
  sub?: string
  valueColor?: string
}

export function KpiCard({ label, value, sub, valueColor }: KpiCardProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 8,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: 'var(--ink-faint)',
          fontFamily: 'IBM Plex Mono, monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontFamily: 'IBM Plex Mono, monospace',
          fontWeight: 600,
          color: valueColor || 'var(--ink)',
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  )
}
