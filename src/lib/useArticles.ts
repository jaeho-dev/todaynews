import { useEffect, useMemo, useRef, useState } from 'react'
import type { Article, NewsResponse } from '../types'

const NON_NEWS_SOURCES = ['google-news', 'frankfurter', 'upbit', 'finnhub']

export function uniqueArticles(groups: Article[][]) {
  const result = new Map<string, Article>()
  groups.flat().forEach((article) => {
    const current = result.get(article.link)
    result.set(article.link, current ? { ...current, matches: [...new Set([...current.matches, ...article.matches])] } : article)
  })
  return [...result.values()].sort((a, b) => b.time - a.time)
}

export async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`${response.status}`)
  return response.json() as Promise<T>
}

function isAbort(error: unknown) {
  return (error as Error).name === 'AbortError'
}

/**
 * 기본 뉴스 피드와 키워드별 검색 결과를 따로 보관한다.
 * 키워드 켜기/끄기는 화면 필터로만 처리되므로 여기서는 keywords(전체)만 본다.
 */
export function useArticles(keywords: string[], enabledSources: string[], refreshKey: number) {
  const [base, setBase] = useState<Article[]>([])
  const [byKeyword, setByKeyword] = useState<Record<string, Article[]>>({})
  const [pendingKeywords, setPendingKeywords] = useState<string[]>([])
  const [baseLoading, setBaseLoading] = useState(true)
  const [baseFailed, setBaseFailed] = useState<string[]>([])
  const [failedKeywords, setFailedKeywords] = useState<string[]>([])
  const [loadError, setLoadError] = useState('')
  const cache = useRef<Record<string, Article[]>>({})
  const keywordKey = keywords.join('\n')
  const googleNews = enabledSources.includes('google-news')

  // 수동 새로고침이거나 Google 뉴스를 껐다 켤 때만 키워드 캐시를 버린다.
  // 시세 소스처럼 무관한 항목을 토글할 때는 캐시를 그대로 둔다.
  useEffect(() => {
    if (Object.keys(cache.current).length === 0) return
    cache.current = {}
    setByKeyword({})
    setFailedKeywords([])
  }, [googleNews, refreshKey])

  useEffect(() => {
    const controller = new AbortController()
    setBaseLoading(true)
    setLoadError('')
    const newsSources = enabledSources.filter((source) => !NON_NEWS_SOURCES.includes(source))
    getJson<NewsResponse>(`/api/news?sources=${encodeURIComponent(newsSources.join(','))}`, controller.signal)
      .then((data) => { setBase(data.articles); setBaseFailed(data.failed) })
      .catch((error) => { if (!isAbort(error)) setLoadError('뉴스를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.') })
      .finally(() => { if (!controller.signal.aborted) setBaseLoading(false) })
    return () => controller.abort()
  }, [enabledSources, refreshKey])

  useEffect(() => {
    // 목록에서 빠진 키워드는 네트워크 없이 캐시에서만 지운다.
    const known = Object.keys(cache.current)
    if (known.some((keyword) => !keywords.includes(keyword))) {
      cache.current = Object.fromEntries(known.filter((keyword) => keywords.includes(keyword)).map((keyword) => [keyword, cache.current[keyword]]))
      setByKeyword(cache.current)
      setFailedKeywords((current) => current.filter((keyword) => keywords.includes(keyword)))
    }

    if (!googleNews) return
    const missing = keywords.filter((keyword) => !(keyword in cache.current))
    if (missing.length === 0) return

    const controller = new AbortController()
    setPendingKeywords((current) => [...new Set([...current, ...missing])])
    missing.forEach((keyword) => {
      getJson<NewsResponse>(`/api/search?q=${encodeURIComponent(keyword)}`, controller.signal)
        .then((data) => {
          cache.current = { ...cache.current, [keyword]: data.articles }
          setByKeyword(cache.current)
          setFailedKeywords((current) => current.filter((item) => item !== keyword))
        })
        .catch((error) => {
          if (isAbort(error)) return
          cache.current = { ...cache.current, [keyword]: [] }
          setByKeyword(cache.current)
          setFailedKeywords((current) => current.includes(keyword) ? current : [...current, keyword])
        })
        .finally(() => {
          if (controller.signal.aborted) return
          setPendingKeywords((current) => current.filter((item) => item !== keyword))
        })
    })
    return () => {
      controller.abort()
      setPendingKeywords((current) => current.filter((keyword) => !missing.includes(keyword)))
    }
  }, [keywordKey, keywords, googleNews, refreshKey])

  const articles = useMemo(
    () => uniqueArticles([base, ...keywords.map((keyword) => byKeyword[keyword] ?? [])]),
    [base, byKeyword, keywords],
  )
  const failed = useMemo(() => [...baseFailed, ...failedKeywords], [baseFailed, failedKeywords])

  return {
    articles,
    failed,
    loadError,
    pendingKeywords,
    initialLoading: baseLoading && articles.length === 0,
    refreshing: baseLoading || pendingKeywords.length > 0,
  }
}
