import type { ApiRequest, ApiResponse, MarketItem } from './_lib/types.js'

async function getExchange(): Promise<MarketItem> {
  const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=KRW', { signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('exchange')
  const data = await response.json() as { rates: { KRW: number } }
  return { id: 'usdkrw', name: 'USD/KRW', value: data.rates.KRW.toLocaleString('ko-KR', { maximumFractionDigits: 2 }), change: null }
}

async function getBitcoin(): Promise<MarketItem> {
  const response = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC', { signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('bitcoin')
  const [data] = await response.json() as Array<{ trade_price: number; signed_change_rate: number }>
  return { id: 'btckrw', name: 'BTC/KRW', value: `${Math.round(data.trade_price / 1_000_000).toLocaleString('ko-KR')}백만`, change: data.signed_change_rate * 100 }
}

async function getStock(symbol: string, token: string): Promise<MarketItem> {
  const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error(symbol)
  const data = await response.json() as { c: number; dp: number }
  if (!data.c) throw new Error(symbol)
  return { id: symbol.toLowerCase(), name: symbol, value: `$${data.c.toLocaleString('en-US')}`, change: data.dp }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET 요청만 지원합니다.' })
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
  const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env
  const token = env?.FINNHUB_API_KEY
  const tasks = [getExchange(), getBitcoin(), ...(token ? [getStock('AAPL', token)] : [])]
  const results = await Promise.allSettled(tasks)
  const items = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])
  return res.status(200).json({ items, fetchedAt: Date.now() })
}
