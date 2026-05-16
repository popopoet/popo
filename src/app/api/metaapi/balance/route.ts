import { NextResponse } from 'next/server'
import { getAccountBalance } from '@/lib/metaapi'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getAccountBalance()
    return NextResponse.json({ ok: true, ...data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
