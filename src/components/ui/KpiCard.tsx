interface KpiCardProps {
  label: string
  value: string
  sub?: string
  delta?: string
  deltaColor?: 'pos' | 'neg' | 'faint'
  valueColor?: string
}

export function KpiCard({ label, value, sub, delta, deltaColor, valueColor }: KpiCardProps) {
  const deltaColorMap = {
    pos: 'var(--green)',
    neg: 'var(--red)',
    faint: 'var(--ink-faint)',
  }
  return (
    <div className="kpi">
      <span className="label">{label}</span>
      <span
        className="v"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
      {delta && (
        <span
          className="delta"
          style={{ color: deltaColor ? deltaColorMap[deltaColor] : 'var(--ink-faint)' }}
        >
          {delta}
        </span>
      )}
      {sub && !delta && (
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--ink-faint)',
          }}
        >
          {sub}
        </span>
      )}
    </div>
  )
}
