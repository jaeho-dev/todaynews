import type { Article, NewsResponse } from './types.js'

export type Feed = {
  id: string
  outlet: string
  url: string
  category: string
}

export const NEWS_FEEDS: Feed[] = [
  { id: 'mk-headline', outlet: '매일경제', url: 'https://www.mk.co.kr/rss/30000001/', category: '경제' },
  { id: 'mk-international', outlet: '매일경제 국제', url: 'https://www.mk.co.kr/rss/30300018/', category: '국제' },
  { id: 'mk-realestate', outlet: '매일경제 부동산', url: 'https://www.mk.co.kr/rss/50300009/', category: '부동산' },
]

const entities: Record<string, string> = {
  amp: '&', apos: "'", gt: '>', lt: '<', quot: '"', nbsp: ' ',
}

function decode(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
    if (entity[0] === '#') {
      const hex = entity[1]?.toLowerCase() === 'x'
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : _
    }
    return entities[entity.toLowerCase()] ?? _
  })
}

function clean(value: string) {
  const decoded = decode(value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'))
  return decode(decoded.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function tag(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'))
  return match ? clean(match[1]) : ''
}

function hash(value: string) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return (result >>> 0).toString(36)
}

function validTime(value: string) {
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

export function parseRss(xml: string, feed: Pick<Feed, 'outlet' | 'category'>, keyword?: string): Article[] {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)]
    .map((match) => {
      const item = match[1]
      const title = tag(item, 'title')
      const link = tag(item, 'link') || tag(item, 'guid')
      const source = tag(item, 'source') || feed.outlet
      if (!title || !link) return null
      return {
        id: hash(link),
        title,
        link,
        outlet: source,
        summary: tag(item, 'description') || '원문에서 자세한 내용을 확인하세요.',
        time: validTime(tag(item, 'pubDate') || tag(item, 'dc:date')),
        category: feed.category,
        matches: keyword ? [keyword] : [],
      }
    })
    .filter((article): article is Article => article !== null)
}

export async function fetchFeed(feed: Feed, keyword?: string) {
  const response = await fetch(feed.url, {
    signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': 'TodayNews/1.0 RSS reader' },
  })
  if (!response.ok) throw new Error(`${feed.outlet}: ${response.status}`)
  return parseRss(await response.text(), feed, keyword)
}

export async function collectFeeds(feeds: Feed[]): Promise<NewsResponse> {
  const results = await Promise.allSettled(feeds.map((feed) => fetchFeed(feed)))
  const failed: string[] = []
  const byLink = new Map<string, Article>()

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      failed.push(feeds[index].outlet)
      return
    }
    result.value.forEach((article) => {
      if (!byLink.has(article.link)) byLink.set(article.link, article)
    })
  })

  return {
    articles: [...byLink.values()].sort((a, b) => b.time - a.time).slice(0, 80),
    failed,
    fetchedAt: Date.now(),
  }
}
