import type { ApiRequest, ApiResponse } from './_lib/types.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST 요청만 지원합니다.' })
  const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env
  if (!env?.ANTHROPIC_API_KEY) {
    return res.status(501).json({ error: 'Vercel 환경변수에 ANTHROPIC_API_KEY를 설정해 주세요.' })
  }
  return res.status(501).json({ error: '요약 기능은 호출 제한 정책을 정한 뒤 활성화할 수 있습니다.' })
}
