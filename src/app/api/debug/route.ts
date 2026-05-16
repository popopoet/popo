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

async function testConnection(url: string | undefined) {
  if (!url) return { status: 'SKIPPED - not set' }
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  })
  try {
    await client.connect()
    const r = await client.query('SELECT current_user')
    await client.end()
    return { status: 'OK', user: r.rows[0].current_user }
  } catch (e) {
    return {
      status: 'FAILED',
      error: String(e),
      code: (e as { code?: string }).code,
    }
  }
}

export async function GET() {
  const urls = {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_POSTGRES_URL: process.env.DATABASE_POSTGRES_URL,
    DATABASE_POSTGRES_PRISMA_URL: process.env.DATABASE_POSTGRES_PRISMA_URL,
    DATABASE_POSTGRES_URL_NON_POOLING: process.env.DATABASE_POSTGRES_URL_NON_POOLING,
  }

  const masked: Record<string, string> = {}
  const tests: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(urls)) {
    masked[k] = maskUrl(v)
    tests[k] = await testConnection(v)
  }

  return NextResponse.json({
    masked,
    tests,
    NODE_ENV: process.env.NODE_ENV,
  })
}
