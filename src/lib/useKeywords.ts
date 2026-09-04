import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'todaynews-keywords'
const DISABLED_STORAGE_KEY = 'todaynews-disabled-keywords'
const defaults = ['금리', '비트코인', '주식']

function parseList(value: string | null) {
  return [...new Set((value ?? '').split(',').map((item) => item.trim()).filter(Boolean))]
}

function initialKeywords() {
  const fromUrl = new URLSearchParams(window.location.search).get('k')
  if (fromUrl) return parseList(fromUrl).slice(0, 8)
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(stored)) return stored.filter((item): item is string => typeof item === 'string').slice(0, 8)
  } catch { /* use defaults */ }
  return defaults
}

function initialDisabledKeywords(keywords: string[]) {
  const params = new URLSearchParams(window.location.search)
  if (params.has('k')) return parseList(params.get('off')).filter((keyword) => keywords.includes(keyword))
  try {
    const stored = JSON.parse(localStorage.getItem(DISABLED_STORAGE_KEY) ?? '[]')
    if (Array.isArray(stored)) return stored.filter((item): item is string => typeof item === 'string' && keywords.includes(item))
  } catch { /* start with every keyword enabled */ }
  return []
}

export function useKeywords() {
  const [keywords, setKeywords] = useState<string[]>(initialKeywords)
  const [disabledKeywords, setDisabledKeywords] = useState<string[]>(() => initialDisabledKeywords(keywords))
  const activeKeywords = useMemo(() => keywords.filter((keyword) => !disabledKeywords.includes(keyword)), [disabledKeywords, keywords])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords))
    localStorage.setItem(DISABLED_STORAGE_KEY, JSON.stringify(disabledKeywords))
    const url = new URL(window.location.href)
    if (keywords.length) url.searchParams.set('k', keywords.join(','))
    else url.searchParams.delete('k')
    if (disabledKeywords.length) url.searchParams.set('off', disabledKeywords.join(','))
    else url.searchParams.delete('off')
    window.history.replaceState(null, '', url)
  }, [disabledKeywords, keywords])

  const toggleKeyword = (keyword: string) => {
    setDisabledKeywords((current) => current.includes(keyword)
      ? current.filter((item) => item !== keyword)
      : [...current, keyword])
  }

  const removeKeyword = (keyword: string) => {
    setKeywords((current) => current.filter((item) => item !== keyword))
    setDisabledKeywords((current) => current.filter((item) => item !== keyword))
  }

  return { keywords, activeKeywords, disabledKeywords, setKeywords, toggleKeyword, removeKeyword }
}
