import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Bookmark, BookmarkCheck, ChevronRight, Clock3, Flame, Globe2, Landmark, Menu, Plus, Power, RefreshCw, Search, Settings2, Sparkles, TrendingUp, X } from 'lucide-react'
import { SourceManager } from './components/SourceManager'
import { relativeTime } from './lib/format'
import { useKeywords } from './lib/useKeywords'
import { useSources } from './lib/useSources'
import type { Article, MarketItem, NewsResponse } from './types'


function loadSaved() {
  try {
    const value = JSON.parse(localStorage.getItem('todaynews-saved') ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch { return [] }
}

function uniqueArticles(groups: Article[][]) {
  const result = new Map<string, Article>()
  groups.flat().forEach((article) => {
    const current = result.get(article.link)
    result.set(article.link, current ? { ...current, matches: [...new Set([...current.matches, ...article.matches])] } : article)
  })
  return [...result.values()].sort((a, b) => b.time - a.time)
}

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`${response.status}`)
  return response.json() as Promise<T>
}

function App() {
  const [query, setQuery] = useState('')
  const [mobileSearch, setMobileSearch] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [showSources, setShowSources] = useState(() => window.location.hash === '#sources')
  const [onlyKeywords, setOnlyKeywords] = useState(true)
  const { keywords, activeKeywords, disabledKeywords, setKeywords, toggleKeyword } = useKeywords()
  const [enabledSources, setEnabledSources] = useSources()
  const [saved, setSaved] = useState<string[]>(loadSaved)
  const [keywordInput, setKeywordInput] = useState('')
  const [showKeywordForm, setShowKeywordForm] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [market, setMarket] = useState<MarketItem[]>([])
  const [failed, setFailed] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = useCallback(() => setRefreshKey((value) => value + 1), [])

  useEffect(() => localStorage.setItem('todaynews-saved', JSON.stringify(saved)), [saved])

  useEffect(() => {
    if (!enabledSources.includes('google-news')) setOnlyKeywords(false)
  }, [enabledSources])

  useEffect(() => {
    if (activeKeywords.length === 0) setOnlyKeywords(false)
  }, [activeKeywords.length])

  useEffect(() => {
    const syncPage = () => setShowSources(window.location.hash === '#sources')
    window.addEventListener('hashchange', syncPage)
    return () => window.removeEventListener('hashchange', syncPage)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function loadNews() {
      setLoading(true)
      setLoadError('')
      try {
        const newsSources = enabledSources.filter((source) => !['google-news', 'frankfurter', 'upbit', 'finnhub'].includes(source))
        const [main, ...searches] = await Promise.all([
          getJson<NewsResponse>(`/api/news?sources=${encodeURIComponent(newsSources.join(','))}`, controller.signal),
          ...(enabledSources.includes('google-news') ? activeKeywords : []).map((keyword) => getJson<NewsResponse>(`/api/search?q=${encodeURIComponent(keyword)}`, controller.signal)
            .catch(() => ({ articles: [], failed: [keyword], fetchedAt: Date.now() }))),
        ])
        setArticles(uniqueArticles([main.articles, ...searches.map((item) => item.articles)]))
        setFailed([...main.failed, ...searches.flatMap((item) => item.failed)])
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setLoadError('뉴스를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    loadNews()
    return () => controller.abort()
  }, [activeKeywords, enabledSources, refreshKey])

  useEffect(() => {
    const controller = new AbortController()
    const marketSources = enabledSources.filter((source) => ['frankfurter', 'upbit', 'finnhub'].includes(source))
    getJson<{ items: MarketItem[] }>(`/api/market?sources=${encodeURIComponent(marketSources.join(','))}`, controller.signal).then((data) => setMarket(data.items)).catch(() => undefined)
    return () => controller.abort()
  }, [enabledSources, refreshKey])

  const keywordArticles = useMemo(() => articles.filter((article) => article.matches.some((keyword) => activeKeywords.includes(keyword))), [activeKeywords, articles])
  const filtered = useMemo(() => {
    const source = showSaved ? articles : onlyKeywords ? keywordArticles : articles
    const term = query.trim().toLowerCase()
    return source.filter((article) => {
      const searchMatch = !term || `${article.title} ${article.summary} ${article.outlet} ${article.matches.join(' ')}`.toLowerCase().includes(term)
      return searchMatch && (!showSaved || saved.includes(article.id))
    })
  }, [articles, keywordArticles, onlyKeywords, query, saved, showSaved])

  const lead = filtered[0]
  const list = filtered.slice(showSaved ? 0 : 1)
  const toggleSave = (id: string) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const openSources = () => { window.location.hash = 'sources'; setShowSources(true) }
  const closeSources = () => { window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`); setShowSources(false) }
  const resetHome = () => { closeSources(); setShowSaved(false); setQuery('') }
  const dateText = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())

  function addKeyword(event: FormEvent) {
    event.preventDefault()
    const value = keywordInput.trim()
    if (value && !keywords.includes(value) && keywords.length < 8) setKeywords((current) => [...current, value])
    setKeywordInput('')
    setShowKeywordForm(false)
  }

  return <div className="min-h-screen bg-[#f4f4ef] text-[#171914]">
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f4f4ef]/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-5 px-5 sm:px-8 lg:px-12">
        <button onClick={resetHome} className="flex shrink-0 items-center gap-2.5 text-left"><span className="grid h-8 w-8 place-items-center bg-[#e65f3c] text-white"><TrendingUp className="h-4 w-4" strokeWidth={2.5} /></span><span className="text-[17px] font-black tracking-[-0.03em]">TODAYNEWS<span className="text-[#e65f3c]">.</span></span></button>
        <span className="hidden h-5 w-px bg-black/15 sm:block" /><p className="hidden text-xs font-medium text-black/45 sm:block">나만의 인사이트 터미널</p>
        <div className="ml-auto hidden w-full max-w-sm items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 md:flex"><Search className="h-4 w-4 text-black/35" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-black/35" placeholder="뉴스, 기업, 키워드 검색" />{query && <button onClick={() => setQuery('')} aria-label="검색어 지우기"><X className="h-3.5 w-3.5 text-black/40" /></button>}</div>
        <button onClick={() => setMobileSearch(!mobileSearch)} className="md:hidden" aria-label="검색"><Search className="h-5 w-5" /></button>
        <button onClick={openSources} className={`grid h-9 w-9 place-items-center rounded-full border transition ${showSources ? 'border-[#171914] bg-[#171914] text-white' : 'border-black/10 bg-white hover:border-black/30'}`} aria-label="연동 사이트 관리"><Settings2 className="h-4 w-4" /></button>
        <button onClick={() => setShowSaved(!showSaved)} className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition ${showSaved ? 'border-[#e65f3c] bg-[#e65f3c] text-white' : 'border-black/10 bg-white hover:border-black/30'}`}><Bookmark className="h-4 w-4" /><span className="hidden sm:inline">저장한 뉴스</span>{saved.length > 0 && <span className="opacity-70">{saved.length}</span>}</button>
      </div>
      {mobileSearch && <div className="border-t border-black/10 px-5 py-3 md:hidden"><div className="flex items-center gap-2 rounded-full bg-white px-4 py-2"><Search className="h-4 w-4 text-black/35" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="뉴스 검색" /></div></div>}
    </header>

    {showSources ? <SourceManager enabled={enabledSources} onChange={setEnabledSources} onClose={closeSources} /> : <main className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 sm:px-8 lg:px-12 lg:pt-14">
      <section className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e65f3c]">{showSaved ? 'MY ARCHIVE' : 'DAILY BRIEFING'}</p><h1 className="text-3xl font-black tracking-[-0.05em] sm:text-5xl">{showSaved ? '저장한 뉴스' : '오늘의 핵심만,'}<br className="sm:hidden" />{!showSaved && ' 빠르게.'}</h1><p className="mt-3 text-sm text-black/50">{showSaved ? `${saved.length}개의 기사를 보관했습니다.` : `${dateText} · ${articles.length}개 기사 업데이트`}</p></div>
        {!showSaved && <div className="flex flex-wrap items-end gap-5 border-y border-black/10 py-3 sm:border-0 sm:py-0">{market.map((item) => <div key={item.id} className="min-w-24"><p className="text-[10px] font-bold text-black/40">{item.name}</p><p className="mt-1 truncate text-sm font-black">{item.value}</p>{item.change !== null && <p className={`text-[11px] font-bold ${item.change >= 0 ? 'text-[#e65f3c]' : 'text-[#375bd2]'}`}>{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%</p>}</div>)}<button onClick={refresh} disabled={loading} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white disabled:opacity-40" aria-label="새로고침"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div>}
      </section>

      {failed.length > 0 && <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-700/15 bg-amber-50 px-4 py-3 text-xs text-amber-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{[...new Set(failed)].join(', ')} 데이터를 불러오지 못했습니다. 다른 뉴스는 정상적으로 표시됩니다.</span></div>}
      {loadError && <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-700/15 bg-red-50 px-4 py-3 text-sm text-red-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{loadError}</span></div>}

      {!showSaved && <section className="mb-10"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-black/35">MY INTERESTS</p><h2 className="mt-1 text-xl font-black tracking-[-0.03em]">내 관심 키워드</h2></div><div className="flex items-center gap-2"><button onClick={() => setOnlyKeywords(!onlyKeywords)} disabled={activeKeywords.length === 0} className={`rounded-full border px-3 py-1.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-35 ${onlyKeywords ? 'border-[#171914] bg-[#171914] text-white' : 'border-black/10 bg-white'}`}>{onlyKeywords ? '관심 뉴스만' : '전체 뉴스'}</button><button onClick={() => setShowKeywordForm(!showKeywordForm)} className="flex items-center gap-1 text-xs font-bold text-black/55 hover:text-black"><Plus className="h-4 w-4" /> 키워드 추가</button></div></div><div className="flex flex-wrap gap-2">{keywords.map((keyword) => { const active = !disabledKeywords.includes(keyword); return <span key={keyword} className={`group flex items-center gap-1 rounded-full border pr-3 text-sm font-bold transition ${active ? 'border-[#e65f3c]/25 bg-[#fff8f5]' : 'border-dashed border-black/15 bg-black/[0.03] text-black/35'}`}><button onClick={() => toggleKeyword(keyword)} aria-pressed={active} title={`${keyword} ${active ? '끄기' : '켜기'}`} className="flex items-center gap-2 py-2 pl-3.5"><Power className={`h-3.5 w-3.5 ${active ? 'text-[#e65f3c]' : 'text-black/25'}`} />{keyword}<span className="text-[10px] font-medium opacity-60">{active ? '켜짐' : '꺼짐'}</span></button><button onClick={() => setKeywords((current) => current.filter((item) => item !== keyword))} className="ml-1 opacity-35 transition hover:opacity-100" aria-label={`${keyword} 삭제`} title={`${keyword} 삭제`}><X className="h-3.5 w-3.5" /></button></span> })}{showKeywordForm && <form onSubmit={addKeyword} className="flex items-center rounded-full border border-[#e65f3c] bg-white pl-4 pr-1"><input autoFocus maxLength={50} value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} className="w-24 bg-transparent text-sm outline-none" placeholder="키워드" /><button className="rounded-full bg-[#e65f3c] px-3 py-1.5 text-xs font-bold text-white">추가</button></form>}</div><p className="mt-2 text-[11px] text-black/35">키워드를 눌러 켜고 끌 수 있어요 · 최대 8개 · 공유 주소에도 선택 상태가 유지됩니다.</p></section>}

      {loading && articles.length === 0 ? <div className="grid place-items-center py-28 text-sm font-bold text-black/40"><RefreshCw className="mb-4 h-7 w-7 animate-spin" />오늘의 뉴스를 모으는 중입니다.</div> : lead ? <>
        {!showSaved && <section className="grid overflow-hidden rounded-2xl border border-black/10 bg-white shadow-card lg:grid-cols-[1.45fr_0.55fr]"><div className="p-6 sm:p-9 lg:p-11"><div className="mb-7 flex items-center gap-2"><span className="flex items-center gap-1.5 rounded-full bg-[#fff0eb] px-3 py-1.5 text-[11px] font-black text-[#d94d2b]"><Flame className="h-3.5 w-3.5" fill="currentColor" /> 최신 주요 뉴스</span></div><p className="mb-3 text-xs font-bold text-[#e65f3c]">{lead.category}{lead.matches.length > 0 && ` · ${lead.matches.join(', ')}`}</p><a href={lead.link} target="_blank" rel="noopener noreferrer"><h2 className="max-w-3xl text-[28px] font-black leading-[1.22] tracking-[-0.045em] transition hover:text-[#e65f3c] sm:text-[42px]">{lead.title}</h2></a><div className="mt-7 border-l-2 border-[#e65f3c] pl-4 sm:pl-5"><p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black text-black/40"><Sparkles className="h-3.5 w-3.5 text-[#e65f3c]" /> RSS 요약</p><p className="max-w-2xl text-sm leading-7 text-black/65">{lead.summary}</p></div><div className="mt-8 flex items-center justify-between"><div className="flex items-center gap-2 text-xs text-black/40"><span className="font-bold text-black/70">{lead.outlet}</span><span>·</span><span>{relativeTime(lead.time)}</span></div><SaveButton active={saved.includes(lead.id)} onClick={() => toggleSave(lead.id)} /></div></div><div className="relative hidden min-h-[420px] overflow-hidden bg-[#1d2928] lg:block"><div className="absolute -right-20 -top-10 h-72 w-72 rounded-full border-[48px] border-[#e65f3c]/90" /><div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border-[65px] border-[#d6c892]/70" /><div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" /><div className="absolute bottom-8 left-8 right-8 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">TODAY'S SIGNAL</p><p className="mt-2 text-lg font-bold">관심 있는 변화만<br />놓치지 마세요.</p></div></div></section>}
        <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_330px]"><div><div className="mb-2 flex items-center justify-between"><h2 className="text-xl font-black tracking-[-0.03em]">{showSaved ? '보관한 기사' : onlyKeywords ? '관심 키워드 주요 뉴스' : '전체 주요 뉴스'}</h2><span className="text-xs text-black/35">{filtered.length}개 뉴스</span></div><div className="divide-y divide-black/10">{list.map((article) => <article key={article.id} className="group grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center"><div className="min-w-0"><div className="mb-2 flex items-center gap-2"><span className="rounded bg-black/[0.06] px-2 py-1 text-[10px] font-black">{article.matches[0] ?? article.category}</span></div><a href={article.link} target="_blank" rel="noopener noreferrer"><h3 className="text-lg font-black leading-snug tracking-[-0.025em] transition group-hover:text-[#e65f3c] sm:text-xl">{article.title}</h3></a><p className="mt-2 line-clamp-2 text-sm leading-6 text-black/50">{article.summary}</p><div className="mt-3 flex items-center gap-2 text-[11px] text-black/35"><span className="font-bold text-black/60">{article.outlet}</span><span>·</span><Clock3 className="h-3 w-3" /><span>{relativeTime(article.time)}</span></div></div><SaveButton active={saved.includes(article.id)} onClick={() => toggleSave(article.id)} /></article>)}</div></div><NewsAside articles={articles} onShowAll={() => setOnlyKeywords(false)} /></section>
      </> : <div className="rounded-2xl border border-dashed border-black/15 py-24 text-center"><Search className="mx-auto h-8 w-8 text-black/20" /><p className="mt-4 font-bold text-black/45">{showSaved ? '아직 저장한 뉴스가 없습니다.' : '조건에 맞는 뉴스가 없습니다.'}</p><button onClick={() => { resetHome(); setOnlyKeywords(false) }} className="mt-4 text-sm font-bold text-[#e65f3c]">전체 뉴스로 돌아가기</button></div>}
    </main>}
    <footer className="border-t border-black/10 px-5 py-8 text-center text-[11px] text-black/35">TODAYNEWS TERMINAL · 중요한 뉴스를 더 적게, 더 빠르게</footer>
  </div>
}

function SaveButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className="justify-self-start rounded-full border border-black/10 p-2.5 transition hover:bg-white sm:justify-self-auto" aria-label="기사 저장">{active ? <BookmarkCheck className="h-4 w-4 fill-[#171914]" /> : <Bookmark className="h-4 w-4" />}</button>
}

function NewsAside({ articles, onShowAll }: { articles: Article[]; onShowAll: () => void }) {
  return <aside className="space-y-4"><div className="rounded-2xl bg-[#1d2928] p-6 text-white"><div className="flex items-center gap-2 text-xs font-bold text-[#d6c892]"><Landmark className="h-4 w-4" /> 금융 / 증권</div><div className="mt-5 space-y-5">{articles.filter((article) => article.category === '증권' || article.category === '경제').slice(0, 3).map((article, index) => <a key={article.id} href={article.link} target="_blank" rel="noopener noreferrer" className="flex w-full items-start gap-3 text-left"><span className="text-xs font-black text-white/25">0{index + 1}</span><span className="text-sm font-bold leading-5">{article.title}</span></a>)}</div><button onClick={onShowAll} className="mt-7 flex items-center gap-1 text-xs font-bold text-white/55 hover:text-white">전체 뉴스 보기 <ChevronRight className="h-3.5 w-3.5" /></button></div><div className="rounded-2xl border border-black/10 bg-white p-6"><div className="flex items-center gap-2 text-xs font-bold text-[#178b72]"><Globe2 className="h-4 w-4" /> 서비스 안내</div><h3 className="mt-4 text-lg font-black leading-snug">키워드는 이 기기에<br />자동 저장됩니다.</h3><p className="mt-3 text-sm leading-6 text-black/50">현재 주소를 다른 기기에서 열면 같은 관심 키워드로 뉴스를 볼 수 있습니다.</p></div></aside>
}

export default App
