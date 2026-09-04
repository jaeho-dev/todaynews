import { useEffect, useState } from 'react'

const STORAGE_KEY = 'todaynews-keywords'
const defaults = ['금리', 'OLED', '비트코인', '삼성전자', 'HBM']

function initialKeywords() {
  const fromUrl = new URLSearchParams(window.location.search).get('k')
  if (fromUrl) return [...new Set(fromUrl.split(',').map((value) => value.trim()).filter(Boolean))].slice(0, 8)
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(stored)) return stored.filter((item): item is string => typeof item === 'string').slice(0, 8)
  } catch { /* use defaults */ }
  return defaults
}

export function useKeywords() {
  const [keywords, setKeywords] = useState<string[]>(initialKeywords)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords))
    const url = new URL(window.location.href)
    if (keywords.length) url.searchParams.set('k', keywords.join(','))
    else url.searchParams.delete('k')
    window.history.replaceState(null, '', url)
  }, [keywords])

  return [keywords, setKeywords] as const
}
