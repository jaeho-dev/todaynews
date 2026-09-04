import { collectFeeds, NEWS_FEEDS } from './_lib/feeds.js'
import type { ApiRequest, ApiResponse } from './_lib/types.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET 요청만 지원합니다.' })
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900')
  try {
    return res.status(200).json(await collectFeeds(NEWS_FEEDS))
  } catch {
    return res.status(500).json({ error: '뉴스를 불러오지 못했습니다.' })
  }
}
