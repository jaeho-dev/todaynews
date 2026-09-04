import { collectFeeds, NEWS_FEEDS } from './_lib/feeds.js'
import type { ApiRequest, ApiResponse } from './_lib/types.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET 요청만 지원합니다.' })
  const rawSources = Array.isArray(req.query.sources) ? req.query.sources[0] : req.query.sources
  const selected = rawSources !== undefined ? new Set(rawSources.split(',').filter(Boolean)) : null
  const feeds = selected ? NEWS_FEEDS.filter((feed) => selected.has(feed.id)) : NEWS_FEEDS
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900')
  try {
    return res.status(200).json(await collectFeeds(feeds))
  } catch {
    return res.status(500).json({ error: '뉴스를 불러오지 못했습니다.' })
  }
}
