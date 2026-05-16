import { NextResponse } from 'next/server'
import { deployAccount } from '@/lib/metaapi'

export async function POST() {
  try {
    await deployAccount()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
