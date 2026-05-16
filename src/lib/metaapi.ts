import type { Direction, Session } from '@prisma/client'
import { calcSession } from './utils'

const BASE = 'https://mt-client-api-v1.london.agiliumtrade.ai'
const MGMT = 'https://trading-account-management-api.agiliumtrade.ai'
const TOKEN = process.env.METAAPI_TOKEN!
const ACCOUNT_ID = process.env.METAAPI_ACCOUNT_ID!

async function mgmtFetch(path: string, method = 'GET', body?: object) {
  const res = await fetch(`${MGMT}${path}`, {
    method,
    headers: {
      'auth-token': TOKEN,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`MetaApi MGMT ${method} ${path}: ${res.status} ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function deployAccount(): Promise<void> {
  await mgmtFetch(`/users/current/accounts/${ACCOUNT_ID}/deploy`, 'POST')
}

export async function undeployAccount(): Promise<void> {
  await mgmtFetch(`/users/current/accounts/${ACCOUNT_ID}/undeploy`, 'POST')
}

export async function getAccountState(): Promise<{ state: string; connectionStatus: string }> {
  const data = await mgmtFetch(`/users/current/accounts/${ACCOUNT_ID}`)
  return {
    state: data.state ?? 'UNKNOWN',
    connectionStatus: data.connectionStatus ?? 'DISCONNECTED',
  }
}

interface MetaDeal {
  id: string
  type: string
  entryType: string
  symbol: string
  volume: number
  price: number
  profit: number
  time: string
  positionId?: string
}

export interface NormalizedDeal {
  symbol: string
  direction: Direction
  exitPrice: number
  lots: number
  pl: number
  pips: number
  exitAt: Date
  session: Session
  result: 'WIN' | 'LOSS' | 'BREAKEVEN'
  sourceId: string
  entryPrice: number
  stopLoss: number
  takeProfit: number
  entryAt: Date
  rr: number
}

export async function fetchHistoryDeals(from: Date, to: Date): Promise<Partial<NormalizedDeal>[]> {
  const fromISO = from.toISOString()
  const toISO = to.toISOString()

  const res = await fetch(
    `${BASE}/users/current/accounts/${ACCOUNT_ID}/history-deals/time/${fromISO}/${toISO}`,
    {
      headers: {
        'auth-token': TOKEN,
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`MetaApi deals fetch: ${res.status} ${text}`)
  }

  const deals: MetaDeal[] = await res.json()

  return deals
    .filter(
      (deal) =>
        (deal.type === 'DEAL_TYPE_BUY' || deal.type === 'DEAL_TYPE_SELL') &&
        deal.entryType === 'DEAL_ENTRY_OUT'
    )
    .map((deal) => {
      const direction: Direction = deal.type === 'DEAL_TYPE_BUY' ? 'BUY' : 'SELL'
      const exitAt = new Date(deal.time)
      const session = calcSession(exitAt)

      let result: 'WIN' | 'LOSS' | 'BREAKEVEN'
      if (deal.profit > 0) result = 'WIN'
      else if (deal.profit < 0) result = 'LOSS'
      else result = 'BREAKEVEN'

      const pips =
        direction === 'BUY' ? (deal.price - 0) * 10 : (0 - deal.price) * 10

      return {
        symbol: deal.symbol,
        direction,
        exitPrice: deal.price,
        lots: deal.volume,
        pl: deal.profit,
        pips,
        exitAt,
        session,
        result,
        sourceId: deal.id,
        entryPrice: deal.price,
        stopLoss: 0,
        takeProfit: 0,
        entryAt: exitAt,
        rr: 0,
      }
    })
}
