import { NextResponse } from 'next/server'
import { getAccountState } from '@/lib/metaapi'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BUILD_MARKER = 'v3-cause-exposed'

export async function GET() {
  const token = process.env.METAAPI_TOKEN
  const accountId = process.env.METAAPI_ACCOUNT_ID

  if (!token || !accountId) {
    return NextResponse.json({ marker: BUILD_MARKER,
      ok: false,
      error: 'METAAPI_TOKEN or METAAPI_ACCOUNT_ID not set',
      tokenSet: !!token,
      accountIdSet: !!accountId,
    })
  }

  try {
    const state = await getAccountState()
    return NextResponse.json({ marker: BUILD_MARKER, ok: true, accountId, state })
  } catch (e) {
    const err = e as Error
    const cause = (err as NodeJS.ErrnoException & { cause?: unknown }).cause
    return NextResponse.json({ marker: BUILD_MARKER,
      ok: false,
      error: String(e),
      cause: cause ? String(cause) : undefined,
      code: (cause as NodeJS.ErrnoException)?.code,
      accountId,
    })
  }
}
