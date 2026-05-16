import Anthropic from '@anthropic-ai/sdk'
import type { Trade } from '@prisma/client'

const client = new Anthropic()

export interface TradeReview {
  quality: string
  sizing: string
  psychology: string
}

export interface WeeklyInsight {
  what_worked: string
  repeating_mistake: string
  lesson: string
}

export async function generateTradeReview(trade: Trade): Promise<TradeReview> {
  const prompt = `You are an expert XAUUSD (Gold) trading coach. Analyze this trade and provide concise feedback in JSON format.

Trade Details:
- Direction: ${trade.direction}
- Entry: ${trade.entryPrice}
- Stop Loss: ${trade.stopLoss}
- Take Profit: ${trade.takeProfit}
- Lots: ${trade.lots}
- Result: ${trade.result}
- Pips: ${trade.pips}
- P&L: $${trade.pl}
- Risk/Reward: ${trade.rr}
- Session: ${trade.session}
- Grade: ${trade.grade}
- Confluence: ${JSON.stringify(trade.confluence)}
- Notes: ${trade.notes || 'None'}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "quality": "1-2 sentence assessment of trade setup quality",
  "sizing": "1-2 sentence assessment of position sizing",
  "psychology": "1-2 sentence assessment of trading psychology shown"
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    return JSON.parse(text) as TradeReview
  } catch {
    return {
      quality: text.slice(0, 200),
      sizing: 'Unable to parse AI response.',
      psychology: '',
    }
  }
}

export async function generateWeeklyInsight(
  weekTrades: Trade[],
  recentSummary: object
): Promise<WeeklyInsight> {
  const prompt = `You are an expert XAUUSD trading coach. Analyze this week's trading performance and provide insights.

This Week's Trades (${weekTrades.length} total):
${weekTrades
  .map(
    (t) =>
      `- ${t.direction} ${t.result} ${t.pips > 0 ? '+' : ''}${t.pips.toFixed(0)} pips, grade ${t.grade}, session ${t.session}`
  )
  .join('\n')}

Recent Performance Summary (last 4 weeks):
${JSON.stringify(recentSummary, null, 2)}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "what_worked": "What trading patterns or behaviors worked well this week",
  "repeating_mistake": "Any repeating mistakes or problematic patterns observed",
  "lesson": "The single most important lesson or focus area for next week"
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    return JSON.parse(text) as WeeklyInsight
  } catch {
    return {
      what_worked: text.slice(0, 300),
      repeating_mistake: 'Unable to parse AI response.',
      lesson: '',
    }
  }
}
