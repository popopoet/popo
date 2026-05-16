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

export interface CurvePoint {
  date: string
  balance: number
  withdrawal?: number
}

interface EquityCurveChartProps {
  data: CurvePoint[]
  currency?: string
}

const CustomTooltip = ({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: CurvePoint }>
  label?: string
  currency: string
}) => {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
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
      <div style={{ color: 'var(--ink)', fontWeight: 600 }}>
        {currency}{point.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      {point.withdrawal ? (
        <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 2 }}>
          ↓ withdraw {currency}{point.withdrawal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      ) : null}
    </div>
  )
}

export function EquityCurveChart({ data, currency = '$' }: EquityCurveChartProps) {
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

  const withdrawalDates = data.filter((d) => d.withdrawal).map((d) => d.date)
  const yMin = Math.min(...data.map((d) => d.balance))
  const yMax = Math.max(...data.map((d) => d.balance))
  const yPad = (yMax - yMin) * 0.1 || 100

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
          width={60}
          domain={[yMin - yPad, yMax + yPad]}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${currency}${(v / 1000).toFixed(1)}k` : `${currency}${v.toFixed(0)}`
          }
        />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        {withdrawalDates.map((d) => (
          <ReferenceLine
            key={d}
            x={d}
            stroke="var(--red)"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{ value: '↓W', position: 'top', fill: 'var(--red)', fontSize: 10 }}
          />
        ))}
        <Line
          type="monotone"
          dataKey="balance"
          stroke="var(--green)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'var(--green)', stroke: 'var(--surface)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
