import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Direction, Session, Result, Grade } from '@prisma/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'all'
  const result = searchParams.get('result')
  const grade = searchParams.get('grade')

  const where: Record<string, unknown> = {}

  if (period !== 'all') {
    const now = new Date()
    const from = new Date()
    if (period === '30d') from.setDate(now.getDate() - 30)
    else if (period === '90d') from.setDate(now.getDate() - 90)
    else if (period === 'ytd') from.setFullYear(now.getFullYear(), 0, 1)
    where.entryAt = { gte: from }
  }

  if (result) where.result = result
  if (grade) where.grade = grade

  try {
    const trades = await prisma.trade.findMany({
      where,
      orderBy: { entryAt: 'desc' },
    })
    return NextResponse.json(trades)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const trade = await prisma.trade.create({
      data: {
        symbol: body.symbol ?? 'XAUUSD',
        direction: body.direction as Direction,
        entryPrice: Number(body.entryPrice),
        stopLoss: Number(body.stopLoss),
        takeProfit: Number(body.takeProfit),
        lots: Number(body.lots),
        entryAt: new Date(body.entryAt),
        exitAt: body.exitAt ? new Date(body.exitAt) : undefined,
        exitPrice: body.exitPrice != null ? Number(body.exitPrice) : undefined,
        session: body.session as Session,
        result: (body.result ?? 'OPEN') as Result,
        pips: Number(body.pips ?? 0),
        pl: Number(body.pl ?? 0),
        rr: Number(body.rr ?? 0),
        grade: (body.grade ?? 'B') as Grade,
        screenshotUrl: body.screenshotUrl ?? undefined,
        notes: body.notes ?? undefined,
        confluence: body.confluence ?? {},
        sourceId: body.sourceId ?? undefined,
      },
    })

    return NextResponse.json(trade, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
