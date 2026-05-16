'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn no-print">
      <Printer size={12} />
      Export PDF
    </button>
  )
}
