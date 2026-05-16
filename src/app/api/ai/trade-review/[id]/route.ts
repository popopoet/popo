import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTradeReview } from '@/lib/claude'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    const trade = await prisma.trade.findUnique({ where: { id } })
    if (!trade) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const review = await generateTradeReview(trade)

    await prisma.trade.update({
      where: { id },
      data: { aiReview: review },
    })

    return NextResponse.json(review)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
