import type { Grade } from '@prisma/client'

const gradeColors: Record<Grade, string> = {
  A_PLUS: 'var(--green)',
  A: 'var(--blue)',
  B: 'var(--amber)',
  C: 'var(--ink-faint)',
}

const gradeLabels: Record<Grade, string> = {
  A_PLUS: 'A+',
  A: 'A',
  B: 'B',
  C: 'C',
}

export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span
      style={{
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 12,
        fontWeight: 600,
        color: gradeColors[grade],
        background: `${gradeColors[grade]}22`,
        border: `1px solid ${gradeColors[grade]}44`,
        borderRadius: 4,
        padding: '2px 6px',
        display: 'inline-block',
      }}
    >
      {gradeLabels[grade]}
    </span>
  )
}
