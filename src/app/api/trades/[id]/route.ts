import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Direction, Session, Result, Grade } from '@prisma/client'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    const trade = await prisma.trade.findUnique({ where: { id } })
    if (!trade) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(trade)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (body.direction !== undefined) data.direction = body.direction as Direction
    if (body.entryPrice !== undefined) data.entryPrice = Number(body.entryPrice)
    if (body.stopLoss !== undefined) data.stopLoss = Number(body.stopLoss)
    if (body.takeProfit !== undefined) data.takeProfit = Number(body.takeProfit)
    if (body.lots !== undefined) data.lots = Number(body.lots)
    if (body.entryAt !== undefined) data.entryAt = new Date(body.entryAt)
    if (body.exitAt !== undefined) data.exitAt = body.exitAt ? new Date(body.exitAt) : null
    if (body.exitPrice !== undefined) data.exitPrice = body.exitPrice != null ? Number(body.exitPrice) : null
    if (body.session !== undefined) data.session = body.session as Session
    if (body.result !== undefined) data.result = body.result as Result
    if (body.pips !== undefined) data.pips = Number(body.pips)
    if (body.pl !== undefined) data.pl = Number(body.pl)
    if (body.rr !== undefined) data.rr = Number(body.rr)
    if (body.grade !== undefined) data.grade = body.grade as Grade
    if (body.screenshotUrl !== undefined) data.screenshotUrl = body.screenshotUrl
    if (body.notes !== undefined) data.notes = body.notes
    if (body.confluence !== undefined) data.confluence = body.confluence
    if (body.aiReview !== undefined) data.aiReview = body.aiReview

    const trade = await prisma.trade.update({ where: { id }, data })
    return NextResponse.json(trade)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    await prisma.trade.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
