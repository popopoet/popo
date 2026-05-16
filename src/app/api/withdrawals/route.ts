import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const withdrawals = await prisma.withdrawal.findMany({ orderBy: { date: 'asc' } })
  return NextResponse.json(withdrawals)
}

export async function POST(req: Request) {
  const { amount, date, note } = await req.json()
  if (!amount || !date) {
    return NextResponse.json({ error: 'amount and date required' }, { status: 400 })
  }
  const w = await prisma.withdrawal.create({
    data: { amount: Number(amount), date: new Date(date), note: note || null },
  })
  return NextResponse.json(w)
}
