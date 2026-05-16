import type { Grade } from '@prisma/client'

const gradeColors: Record<Grade, string> = {
  A_PLUS: 'var(--green)',
  A: 'var(--blue)',
  B: 'var(--amber)',
  C: 'var(--red)',
}

const gradeLabels: Record<Grade, string> = {
  A_PLUS: 'A+',
  A: 'A',
  B: 'B',
  C: 'C',
}

export function GradeBadge({ grade, size = 'sm' }: { grade: Grade; size?: 'sm' | 'md' }) {
  const color = gradeColors[grade]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: size === 'md' ? 40 : 32,
        padding: size === 'md' ? '4px 10px' : '2px 7px',
        borderRadius: 4,
        fontFamily: 'var(--mono)',
        fontSize: size === 'md' ? 13 : 11,
        fontWeight: 600,
        color,
        border: `1px solid ${color}`,
        background: 'transparent',
        lineHeight: 1.2,
      }}
    >
      {gradeLabels[grade]}
    </span>
  )
}
