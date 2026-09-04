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
