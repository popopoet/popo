import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Withdrawal" (
        "id" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "note" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Withdrawal_date_idx" ON "Withdrawal"("date")
    `)
    return NextResponse.json({ ok: true, message: 'Withdrawal table ready' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
