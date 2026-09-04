import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import newsHandler from './api/news'
import searchHandler from './api/search'
import marketHandler from './api/market'
import type { ApiRequest, ApiResponse } from './api/_lib/types'

const apiRoutes = new Map([
  ['/news', newsHandler],
  ['/search', searchHandler],
  ['/market', marketHandler],
])

function localApi(): Plugin {
  return {
    name: 'todaynews-local-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const request = req as typeof req & { url?: string; method?: string }
        const url = new URL(request.url ?? '/', 'http://localhost')
        const handler = apiRoutes.get(url.pathname)
        if (!handler) return next()

        const query: ApiRequest['query'] = {}
        url.searchParams.forEach((value, key) => { query[key] = value })
        let statusCode = 200
        const response: ApiResponse = {
          status(code) { statusCode = code; return response },
          setHeader(name, value) { res.setHeader(name, value) },
          json(body) {
            res.statusCode = statusCode
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(body))
          },
        }

        try {
          await handler({ method: request.method, query }, response)
        } catch {
          response.status(500).json({ error: '로컬 API 실행 중 오류가 발생했습니다.' })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localApi()],
})
