import { NextResponse } from 'next/server'
import { fetchHistoryDeals } from '@/lib/metaapi'
import { prisma } from '@/lib/prisma'
import type { Direction, Session, Result, Grade } from '@prisma/client'

export async function POST() {
  try {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 90)

    const deals = await fetchHistoryDeals(from, to)

    let synced = 0

    for (const deal of deals) {
      if (!deal.sourceId) continue

      const existing = await prisma.trade.findFirst({
        where: { sourceId: deal.sourceId },
      })

      if (existing) continue

      await prisma.trade.create({
        data: {
          symbol: deal.symbol ?? 'XAUUSD',
          direction: (deal.direction ?? 'BUY') as Direction,
          entryPrice: deal.entryPrice ?? 0,
          stopLoss: deal.stopLoss ?? 0,
          takeProfit: deal.takeProfit ?? 0,
          lots: deal.lots ?? 0.01,
          entryAt: deal.entryAt ?? new Date(),
          exitAt: deal.exitAt,
          exitPrice: deal.exitPrice,
          session: (deal.session ?? 'LONDON') as Session,
          result: (deal.result ?? 'OPEN') as Result,
          pips: deal.pips ?? 0,
          pl: deal.pl ?? 0,
          rr: deal.rr ?? 0,
          grade: 'B' as Grade,
          sourceId: deal.sourceId,
          confluence: {},
        },
      })
      synced++
    }

    return NextResponse.json({ count: synced })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
