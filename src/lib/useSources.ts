import { useEffect, useState } from 'react'
import { defaultSourceIds } from '../data/sources'

const STORAGE_KEY = 'todaynews-sources'

function initialSources() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(stored)) return stored.filter((item): item is string => defaultSourceIds.includes(item))
  } catch { /* use defaults */ }
  return defaultSourceIds
}

export function useSources() {
  const [sources, setSources] = useState<string[]>(initialSources)
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(sources)), [sources])
  return [sources, setSources] as const
}
