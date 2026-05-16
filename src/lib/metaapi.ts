import type { Direction, Session } from '@prisma/client'
import { calcSession, calcPips } from './utils'

const MGMT = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai'
const CLIENT_DOMAIN = 'agiliumtrade.ai'
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

interface AccountInfo {
  _id: string
  state: string
  connectionStatus: string
  region?: string
  accountReplicas?: Array<{ region: string; state?: string }>
}

async function getAccountInfo(): Promise<AccountInfo> {
  return mgmtFetch(`/users/current/accounts/${ACCOUNT_ID}`)
}

let _cachedRegion: string | null = null

async function clientFetch(path: string) {
  if (!_cachedRegion) {
    const info = await getAccountInfo()
    _cachedRegion = info.region ?? info.accountReplicas?.[0]?.region ?? 'new-york'
  }
  const region = _cachedRegion
  const url = `https://mt-client-api-v1.${region}.${CLIENT_DOMAIN}${path}`

  const res = await fetch(url, { headers: { 'auth-token': TOKEN } })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`MetaApi CLIENT ${path} (region=${region}): ${res.status} ${text}`)
  }
  return res.json()
}

export async function deployAccount(): Promise<void> {
  await mgmtFetch(`/users/current/accounts/${ACCOUNT_ID}/deploy`, 'POST')
}

export async function undeployAccount(): Promise<void> {
  await mgmtFetch(`/users/current/accounts/${ACCOUNT_ID}/undeploy`, 'POST')
}

export async function getAccountState(): Promise<{
  state: string
  connectionStatus: string
  region?: string
}> {
  const info = await getAccountInfo()
  return {
    state: info.state ?? 'UNKNOWN',
    connectionStatus: info.connectionStatus ?? 'DISCONNECTED',
    region: info.region ?? info.accountReplicas?.[0]?.region,
  }
}

interface RawDeal {
  id: string
  type: string
  entryType: string
  symbol: string
  volume: number
  price: number
  profit: number
  commission?: number
  swap?: number
  time: string
  positionId?: string
  stopLoss?: number
  takeProfit?: number
  comment?: string
}

export interface NormalizedDeal {
  symbol: string
  direction: Direction
  entryPrice: number
  exitPrice: number
  stopLoss: number
  takeProfit: number
  lots: number
  pl: number
  pips: number
  entryAt: Date
  exitAt: Date
  session: Session
  result: 'WIN' | 'LOSS' | 'BREAKEVEN'
  sourceId: string
  rr: number
}

export async function fetchHistoryDeals(from: Date, to: Date): Promise<Partial<NormalizedDeal>[]> {
  const fromISO = from.toISOString()
  const toISO = to.toISOString()

  const raw = await clientFetch(
    `/users/current/accounts/${ACCOUNT_ID}/history-deals/time/${fromISO}/${toISO}`
  )

  if (!Array.isArray(raw)) {
    throw new Error(`history-deals returned non-array: ${JSON.stringify(raw)}`)
  }

  const deals: RawDeal[] = raw
  const xauDeals = deals.filter(
    (d) =>
      d.symbol?.includes('XAU') ||
      d.symbol?.includes('GOLD') ||
      d.symbol === 'XAUUSD'
  )

  const byPosition: Record<string, { in?: RawDeal; out?: RawDeal }> = {}

  for (const deal of xauDeals) {
    const posId = deal.positionId ?? deal.id
    if (!byPosition[posId]) byPosition[posId] = {}

    if (deal.entryType === 'DEAL_ENTRY_IN') {
      byPosition[posId].in = deal
    } else if (deal.entryType === 'DEAL_ENTRY_OUT' || deal.entryType === 'DEAL_ENTRY_INOUT') {
      byPosition[posId].out = deal
    }
  }

  const result: Partial<NormalizedDeal>[] = []

  for (const [posId, pair] of Object.entries(byPosition)) {
    const exitDeal = pair.out
    if (!exitDeal) continue

    const entryDeal = pair.in
    const direction: Direction =
      exitDeal.type === 'DEAL_TYPE_SELL' ? 'SELL' : 'BUY'

    const entryPrice = entryDeal?.price ?? exitDeal.price
    const exitPrice = exitDeal.price
    const stopLoss = entryDeal?.stopLoss ?? exitDeal.stopLoss ?? 0
    const takeProfit = entryDeal?.takeProfit ?? exitDeal.takeProfit ?? 0
    const lots = exitDeal.volume ?? entryDeal?.volume ?? 0.01
    const pl = exitDeal.profit + (exitDeal.commission ?? 0) + (exitDeal.swap ?? 0)

    const entryAt = entryDeal ? new Date(entryDeal.time) : new Date(exitDeal.time)
    const exitAt = new Date(exitDeal.time)
    const session = calcSession(entryAt)
    const pips = calcPips(entryPrice, exitPrice, direction)

    let tradeResult: 'WIN' | 'LOSS' | 'BREAKEVEN'
    if (pips > 0) tradeResult = 'WIN'
    else if (pips < 0) tradeResult = 'LOSS'
    else tradeResult = 'BREAKEVEN'

    const risk = Math.abs(entryPrice - stopLoss)
    const reward = Math.abs(takeProfit - entryPrice)
    const rr = risk > 0 ? Math.round((reward / risk) * 100) / 100 : 0

    result.push({
      symbol: exitDeal.symbol,
      direction,
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      lots,
      pl,
      pips,
      entryAt,
      exitAt,
      session,
      result: tradeResult,
      sourceId: posId,
      rr,
    })
  }

  return result
}
