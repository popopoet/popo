import { NextResponse } from 'next/server'
import { fetchHistoryDeals } from '@/lib/metaapi'
import { prisma } from '@/lib/prisma'
import type { Direction, Session, Result, Grade } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BUILD_MARKER = 'v4-debug-sync'

async function runSync(days: number) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)

  const startedAt = Date.now()
  const deals = await fetchHistoryDeals(from, to)
  const fetchMs = Date.now() - startedAt

  let synced = 0
  for (const deal of deals) {
    if (!deal.sourceId) continue
    const existing = await prisma.trade.findFirst({ where: { sourceId: deal.sourceId } })
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

  return { marker: BUILD_MARKER, count: synced, fetched: deals.length, fetchMs, days }
}

function errorPayload(e: unknown) {
  const err = e as Error
  const cause = (err as NodeJS.ErrnoException & { cause?: unknown }).cause
  return {
    marker: BUILD_MARKER,
    error: String(e),
    cause: cause ? String(cause) : undefined,
    code: (cause as NodeJS.ErrnoException)?.code,
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const days = Number(url.searchParams.get('days') ?? '7')
  try {
    return NextResponse.json(await runSync(days))
  } catch (e) {
    return NextResponse.json(errorPayload(e), { status: 500 })
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const days = Number(url.searchParams.get('days') ?? '7')
  try {
    return NextResponse.json(await runSync(days))
  } catch (e) {
    return NextResponse.json(errorPayload(e), { status: 500 })
  }
}
