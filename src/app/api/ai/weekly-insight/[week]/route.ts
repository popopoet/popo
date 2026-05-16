import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateWeeklyInsight } from '@/lib/claude'
import { getWeekRange } from '@/lib/utils'
import type { Trade } from '@prisma/client'

interface RouteContext {
  params: Promise<{ week: string }>
}

export async function POST(_request: Request, { params }: RouteContext) {
  const { week } = await params
  try {
    const { start, end } = getWeekRange(week)

    const weekTrades = await prisma.trade.findMany({
      where: { entryAt: { gte: start, lte: end } },
      orderBy: { entryAt: 'asc' },
    })

    const fourWeeksAgo = new Date(start)
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    const recentTrades = await prisma.trade.findMany({
      where: { entryAt: { gte: fourWeeksAgo, lt: start } },
    })

    const wins = recentTrades.filter((t: Trade) => t.result === 'WIN').length
    const losses = recentTrades.filter((t: Trade) => t.result === 'LOSS').length
    const totalPips = recentTrades.reduce((s: number, t: Trade) => s + t.pips, 0)

    const recentSummary = {
      period: 'last 4 weeks',
      totalTrades: recentTrades.length,
      wins,
      losses,
      winRate: recentTrades.length > 0 ? ((wins / recentTrades.length) * 100).toFixed(1) + '%' : 'N/A',
      netPips: totalPips.toFixed(0),
    }

    const insight = await generateWeeklyInsight(weekTrades, recentSummary)

    return NextResponse.json(insight)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
