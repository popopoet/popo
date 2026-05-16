'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface EquityPoint {
  date: string
  equity: number
}

interface EquityCurveChartProps {
  data: EquityPoint[]
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--line)',
        borderRadius: 6,
        padding: '8px 12px',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 12,
      }}
    >
      <div style={{ color: 'var(--ink-dim)', marginBottom: 2 }}>{label}</div>
      <div style={{ color: val >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
        {val >= 0 ? '+' : ''}{val.toFixed(0)} pips
      </div>
    </div>
  )
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  if (!data.length) {
    return (
      <div
        style={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ink-faint)',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 13,
        }}
      >
        No trade data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'var(--ink-faint)', fontFamily: 'IBM Plex Mono, monospace' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--ink-faint)', fontFamily: 'IBM Plex Mono, monospace' }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="var(--line-strong)" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="equity"
          stroke="var(--green)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'var(--green)', stroke: 'var(--surface)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
