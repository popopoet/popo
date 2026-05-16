import { NextResponse } from 'next/server'
import { Client } from 'pg'

export const dynamic = 'force-dynamic'

function maskUrl(url: string | undefined): string {
  if (!url) return 'NOT SET'
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.username}:***${u.password.slice(-4)}@${u.host}${u.pathname}`
  } catch {
    return `INVALID URL: ${url.slice(0, 30)}...`
  }
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  const result: Record<string, unknown> = {
    DATABASE_URL: maskUrl(dbUrl),
    DATABASE_POSTGRES_URL: maskUrl(process.env.DATABASE_POSTGRES_URL),
    DATABASE_POSTGRES_PRISMA_URL: maskUrl(process.env.DATABASE_POSTGRES_PRISMA_URL),
    DATABASE_POSTGRES_URL_NON_POOLING: maskUrl(process.env.DATABASE_POSTGRES_URL_NON_POOLING),
    DATABASE_POSTGRES_PASSWORD_last4: process.env.DATABASE_POSTGRES_PASSWORD?.slice(-4) ?? 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  }

  if (!dbUrl) {
    return NextResponse.json({ ...result, connectionTest: 'SKIPPED - no DATABASE_URL' })
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  })

  try {
    await client.connect()
    const r = await client.query('SELECT current_user, current_database()')
    await client.end()
    return NextResponse.json({ ...result, connectionTest: 'OK', queryResult: r.rows[0] })
  } catch (e) {
    return NextResponse.json({
      ...result,
      connectionTest: 'FAILED',
      error: String(e),
      errorCode: (e as { code?: string }).code,
    })
  }
}
