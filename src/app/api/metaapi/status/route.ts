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
    const err = e as Error
    const cause = (err as NodeJS.ErrnoException & { cause?: unknown }).cause
    return NextResponse.json({
      ok: false,
      error: String(e),
      cause: cause ? String(cause) : undefined,
      code: (cause as NodeJS.ErrnoException)?.code,
      accountId,
    })
  }
}
