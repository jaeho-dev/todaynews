import { fetchFeed } from './_lib/feeds.js'
import type { ApiRequest, ApiResponse, NewsResponse } from './_lib/types.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET 요청만 지원합니다.' })
  const raw = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q
  const query = raw?.trim().slice(0, 50)
  if (!query) return res.status(400).json({ error: '검색어를 입력해 주세요.' })

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900')
  const feed = {
    outlet: 'Google 뉴스',
    category: '관심',
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`,
  }

  try {
    const payload: NewsResponse = {
      articles: (await fetchFeed(feed, query)).slice(0, 20),
      failed: [],
      fetchedAt: Date.now(),
    }
    return res.status(200).json(payload)
  } catch {
    return res.status(502).json({ articles: [], failed: [query], fetchedAt: Date.now() })
  }
}
