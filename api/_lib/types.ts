export type Article = {
  id: string
  title: string
  link: string
  outlet: string
  summary: string
  time: number
  category: string
  matches: string[]
}

export type NewsResponse = {
  articles: Article[]
  failed: string[]
  fetchedAt: number
}

export type MarketItem = {
  id: string
  name: string
  value: string
  change: number | null
}

export type ApiRequest = {
  method?: string
  query: Record<string, string | string[] | undefined>
  body?: unknown
}

export type ApiResponse = {
  status(code: number): ApiResponse
  json(body: unknown): void
  setHeader(name: string, value: string): void
}
