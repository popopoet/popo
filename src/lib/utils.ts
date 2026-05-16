import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Direction, Grade, Session } from '@prisma/client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPips(p: number): string {
  return p >= 0 ? `+${Math.round(p)}` : `${Math.round(p)}`
}

export function formatPL(p: number): string {
  if (p >= 0) return `+$${p.toFixed(0)}`
  return `-$${Math.abs(p).toFixed(0)}`
}

export function formatPrice(p: number): string {
  return p.toFixed(2)
}

export function calcSession(date: Date): Session {
  const hour = date.getUTCHours()
  if (hour >= 0 && hour < 8) return 'ASIA'
  if (hour >= 8 && hour < 13) return 'LONDON'
  return 'NEW_YORK'
}

export interface ConfluenceData {
  sndFresh?: boolean
  sndTimeframe?: string
  bosChoCh?: boolean
  bosTimeframe?: string
  volume?: boolean
  volumeNote?: string
  fundamental?: boolean
  fundamentalNote?: string
  [key: string]: boolean | string | undefined
}

export function calcGrade(confluence: ConfluenceData): Grade {
  const checks = ['sndFresh', 'bosChoCh', 'volume', 'fundamental']
  const count = checks.filter((k) => Boolean(confluence[k])).length
  if (count >= 4) return 'A_PLUS'
  if (count === 3) return 'A'
  if (count === 2) return 'B'
  return 'C'
}

export function calcRR(entry: number, sl: number, tp: number): number {
  const risk = Math.abs(entry - sl)
  const reward = Math.abs(tp - entry)
  if (risk === 0) return 0
  return Math.round((reward / risk) * 100) / 100
}

export function calcPips(entry: number, exit: number, direction: Direction): number {
  if (direction === 'BUY') return (exit - entry) * 10
  return (entry - exit) * 10
}

export function getWeekRange(week: string): { start: Date; end: Date } {
  const [yearStr, weekStr] = week.split('-W')
  const year = parseInt(yearStr, 10)
  const weekNum = parseInt(weekStr, 10)

  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (weekNum - 1) * 7)

  const friday = new Date(monday)
  friday.setUTCDate(monday.getUTCDate() + 4)
  friday.setUTCHours(23, 59, 59, 999)

  return { start: monday, end: friday }
}

export function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}
