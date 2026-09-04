import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'todaynews-keywords'
const DISABLED_STORAGE_KEY = 'todaynews-disabled-keywords'
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

function initialDisabledKeywords() {
  const params = new URLSearchParams(window.location.search)
  if (params.has('k')) {
    return [...new Set((params.get('off') ?? '').split(',').map((value) => value.trim()).filter(Boolean))]
  }
  try {
    const stored = JSON.parse(localStorage.getItem(DISABLED_STORAGE_KEY) ?? '[]')
    if (Array.isArray(stored)) return stored.filter((item): item is string => typeof item === 'string')
  } catch { /* start with every keyword enabled */ }
  return []
}

export function useKeywords() {
  const [keywords, setKeywords] = useState<string[]>(initialKeywords)
  const [disabledKeywords, setDisabledKeywords] = useState<string[]>(initialDisabledKeywords)
  const activeKeywords = useMemo(() => keywords.filter((keyword) => !disabledKeywords.includes(keyword)), [disabledKeywords, keywords])

  useEffect(() => {
    const disabled = disabledKeywords.filter((keyword) => keywords.includes(keyword))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords))
    localStorage.setItem(DISABLED_STORAGE_KEY, JSON.stringify(disabled))
    const url = new URL(window.location.href)
    if (keywords.length) url.searchParams.set('k', keywords.join(','))
    else url.searchParams.delete('k')
    if (disabled.length) url.searchParams.set('off', disabled.join(','))
    else url.searchParams.delete('off')
    window.history.replaceState(null, '', url)
    if (disabled.length !== disabledKeywords.length) setDisabledKeywords(disabled)
  }, [disabledKeywords, keywords])

  const toggleKeyword = (keyword: string) => {
    setDisabledKeywords((current) => current.includes(keyword)
      ? current.filter((item) => item !== keyword)
      : [...current, keyword])
  }

  return { keywords, activeKeywords, disabledKeywords, setKeywords, toggleKeyword }
}
