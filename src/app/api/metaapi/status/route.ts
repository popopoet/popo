import { NextResponse } from 'next/server'
import { getAccountState } from '@/lib/metaapi'

export async function GET() {
  const token = process.env.METAAPI_TOKEN
  const accountId = process.env.METAAPI_ACCOUNT_ID

  if (!token || !accountId) {
    return NextResponse.json({
      ok: false,
      error: 'METAAPI_TOKEN or METAAPI_ACCOUNT_ID not set',
      tokenSet: !!token,
      accountIdSet: !!accountId,
    })
  }

  try {
    const state = await getAccountState()
    return NextResponse.json({ ok: true, accountId, state })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e), accountId })
  }
}
