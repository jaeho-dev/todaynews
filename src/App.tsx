import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Clock3,
  Flame,
  Globe2,
  Landmark,
  Menu,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'

type Article = {
  id: number
  category: string
  title: string
  summary: string
  source: string
  time: string
  keyword?: string
  relevance?: number
  important?: boolean
  cluster?: number
  accent: string
}

const categories = ['전체', '경제', '증권', '부동산', '국제', '산업', '테크', '가상자산']

const articles: Article[] = [
  {
    id: 1,
    category: '경제',
    title: '한은, 기준금리 동결…“물가와 성장 불확실성 함께 본다”',
    summary: '한국은행이 기준금리를 현 수준으로 유지했습니다. 시장은 하반기 물가 경로와 가계대출 흐름이 향후 인하 시점을 결정할 것으로 보고 있습니다.',
    source: '연합뉴스', time: '8분 전', keyword: '금리', relevance: 98, important: true, cluster: 18, accent: 'bg-[#e65f3c]',
  },
  {
    id: 2,
    category: '증권',
    title: '외국인 순매수 전환…코스피 2,700선 회복',
    summary: '반도체 대형주를 중심으로 외국인 매수세가 유입되며 지수가 상승했습니다. 원·달러 환율 안정도 투자심리 개선에 힘을 보탰습니다.',
    source: '한국경제', time: '14분 전', keyword: '삼성전자', relevance: 91, cluster: 7, accent: 'bg-[#375bd2]',
  },
  {
    id: 3,
    category: '테크',
    title: '삼성디스플레이, 차세대 OLED 생산라인 투자 본격화',
    summary: '노트북과 태블릿용 중형 OLED 수요 확대에 대응하는 투자입니다. 장비 발주가 이어지며 국내 소재·부품 기업의 수혜 기대도 커지고 있습니다.',
    source: '전자신문', time: '23분 전', keyword: 'OLED', relevance: 96, important: true, cluster: 12, accent: 'bg-[#6c52b8]',
  },
  {
    id: 4,
    category: '국제',
    title: '미 고용지표 둔화…국채금리 하락하고 달러 약세',
    summary: '미국 노동시장 과열이 완화됐다는 신호에 연준의 금리 인하 기대가 다시 높아졌습니다. 아시아 증시에도 우호적인 흐름이 예상됩니다.',
    source: '블룸버그', time: '31분 전', keyword: '금리', relevance: 89, cluster: 9, accent: 'bg-[#178b72]',
  },
  {
    id: 5,
    category: '가상자산',
    title: '비트코인 현물 ETF 순유입 확대…시장 강세 전환',
    summary: '기관 자금 유입이 회복되며 주요 가상자산이 동반 상승했습니다. 다만 단기 급등에 따른 변동성 확대 가능성은 남아 있습니다.',
    source: '코인데스크', time: '42분 전', keyword: '비트코인', relevance: 94, cluster: 5, accent: 'bg-[#d99422]',
  },
  {
    id: 6,
    category: '부동산',
    title: '서울 아파트 거래량 두 달 연속 증가',
    summary: '선호 지역 중심으로 매수 문의가 늘면서 거래량이 회복세를 보였습니다. 전문가들은 대출금리와 공급 전망을 함께 살펴야 한다고 조언합니다.',
    source: '매일경제', time: '1시간 전', cluster: 4, accent: 'bg-[#91623d]',
  },
  {
    id: 7,
    category: '산업',
    title: 'HBM 공급 경쟁 가속…국내 반도체 투자 확대',
    summary: 'AI 서버 수요가 이어지면서 고대역폭메모리 생산능력 확보 경쟁이 치열해지고 있습니다. 후공정 장비와 소재 기업에도 관심이 쏠립니다.',
    source: '서울경제', time: '1시간 전', keyword: 'HBM', relevance: 93, cluster: 11, accent: 'bg-[#237f9c]',
  },
]

const marketRows = [
  ['KOSPI', '2,735.21', '+0.84%'],
  ['NASDAQ', '18,028.76', '+1.12%'],
  ['USD/KRW', '1,367.40', '-0.31%'],
]

function loadList<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [activeCategory, setActiveCategory] = useState('전체')
  const [query, setQuery] = useState('')
  const [mobileSearch, setMobileSearch] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [keywords, setKeywords] = useState<string[]>(() => loadList('mynews-keywords', ['금리', 'OLED', '비트코인', '삼성전자', 'HBM']))
  const [saved, setSaved] = useState<number[]>(() => loadList('mynews-saved', []))
  const [keywordInput, setKeywordInput] = useState('')
  const [showKeywordForm, setShowKeywordForm] = useState(false)

  useEffect(() => localStorage.setItem('mynews-keywords', JSON.stringify(keywords)), [keywords])
  useEffect(() => localStorage.setItem('mynews-saved', JSON.stringify(saved)), [saved])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return articles.filter((article) => {
      const categoryMatch = activeCategory === '전체' || article.category === activeCategory
      const searchMatch = !term || `${article.title} ${article.summary} ${article.source} ${article.keyword ?? ''}`.toLowerCase().includes(term)
      const savedMatch = !showSaved || saved.includes(article.id)
      return categoryMatch && searchMatch && savedMatch
    })
  }, [activeCategory, query, saved, showSaved])

  const keywordNews = filtered.filter((article) => article.keyword && keywords.includes(article.keyword)).slice(0, 4)
  const lead = filtered[0]

  function toggleSave(id: number) {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  function addKeyword(event: FormEvent) {
    event.preventDefault()
    const value = keywordInput.trim()
    if (value && !keywords.includes(value)) setKeywords((current) => [...current, value])
    setKeywordInput('')
    setShowKeywordForm(false)
  }

  const dateText = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())

  return (
    <div className="min-h-screen bg-[#f4f4ef] text-[#171914]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f4f4ef]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-5 px-5 sm:px-8 lg:px-12">
          <button className="lg:hidden" aria-label="메뉴"><Menu className="h-5 w-5" /></button>
          <button onClick={() => { setShowSaved(false); setActiveCategory('전체'); setQuery('') }} className="flex shrink-0 items-center gap-2.5 text-left">
            <span className="grid h-8 w-8 place-items-center bg-[#e65f3c] text-white"><TrendingUp className="h-4 w-4" strokeWidth={2.5} /></span>
            <span className="text-[17px] font-black tracking-[-0.03em]">MYNEWS<span className="text-[#e65f3c]">.</span></span>
          </button>
          <span className="hidden h-5 w-px bg-black/15 sm:block" />
          <p className="hidden text-xs font-medium text-black/45 sm:block">나만의 인사이트 터미널</p>
          <div className="ml-auto hidden w-full max-w-sm items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 md:flex">
            <Search className="h-4 w-4 text-black/35" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-black/35" placeholder="뉴스, 기업, 키워드 검색" />
            {query && <button onClick={() => setQuery('')}><X className="h-3.5 w-3.5 text-black/40" /></button>}
          </div>
          <button onClick={() => setMobileSearch(!mobileSearch)} className="md:hidden" aria-label="검색"><Search className="h-5 w-5" /></button>
          <button onClick={() => setShowSaved(!showSaved)} className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition ${showSaved ? 'border-[#e65f3c] bg-[#e65f3c] text-white' : 'border-black/10 bg-white hover:border-black/30'}`}>
            <Bookmark className="h-4 w-4" /> <span className="hidden sm:inline">저장한 뉴스</span>{saved.length > 0 && <span className="opacity-70">{saved.length}</span>}
          </button>
        </div>
        {mobileSearch && <div className="border-t border-black/10 px-5 py-3 md:hidden"><div className="flex items-center gap-2 rounded-full bg-white px-4 py-2"><Search className="h-4 w-4 text-black/35" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="뉴스 검색" /></div></div>}
        <nav className="mx-auto flex max-w-[1440px] gap-7 overflow-x-auto px-5 sm:px-8 lg:px-12">
          {categories.map((category) => <button key={category} onClick={() => { setActiveCategory(category); setShowSaved(false) }} className={`shrink-0 border-b-2 py-3 text-sm font-bold transition ${activeCategory === category && !showSaved ? 'border-[#171914] text-[#171914]' : 'border-transparent text-black/40 hover:text-black'}`}>{category}</button>)}
        </nav>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 sm:px-8 lg:px-12 lg:pt-14">
        <section className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e65f3c]">{showSaved ? 'MY ARCHIVE' : 'DAILY BRIEFING'}</p>
            <h1 className="text-3xl font-black tracking-[-0.05em] sm:text-5xl">{showSaved ? '저장한 뉴스' : '오늘의 핵심만,'}<br className="sm:hidden" />{!showSaved && ' 빠르게.'}</h1>
            <p className="mt-3 text-sm text-black/50">{showSaved ? `${saved.length}개의 기사를 나중에 읽을 수 있도록 보관했습니다.` : `${dateText} · 128개 매체에서 업데이트됨`}</p>
          </div>
          {!showSaved && <div className="flex gap-5 border-y border-black/10 py-3 sm:border-0 sm:py-0">
            {marketRows.map(([name, value, rate]) => <div key={name} className="min-w-0 sm:min-w-24"><p className="text-[10px] font-bold text-black/40">{name}</p><p className="mt-1 truncate text-sm font-black">{value}</p><p className={`text-[11px] font-bold ${rate.startsWith('+') ? 'text-[#e65f3c]' : 'text-[#287e69]'}`}>{rate}</p></div>)}
          </div>}
        </section>

        {lead ? (
          <>
            {!showSaved && <section className="grid overflow-hidden rounded-2xl border border-black/10 bg-white shadow-card lg:grid-cols-[1.45fr_0.55fr]">
              <div className="p-6 sm:p-9 lg:p-11">
                <div className="mb-7 flex items-center gap-2"><span className="flex items-center gap-1.5 rounded-full bg-[#fff0eb] px-3 py-1.5 text-[11px] font-black text-[#d94d2b]"><Flame className="h-3.5 w-3.5" fill="currentColor" /> 매우 중요</span><span className="text-xs text-black/35">관련 기사 {lead.cluster}개</span></div>
                <p className="mb-3 text-xs font-bold text-[#e65f3c]">{lead.category} · {lead.keyword}</p>
                <h2 className="max-w-3xl text-[28px] font-black leading-[1.22] tracking-[-0.045em] sm:text-[42px]">{lead.title}</h2>
                <div className="mt-7 border-l-2 border-[#e65f3c] pl-4 sm:pl-5"><p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black text-black/40"><Sparkles className="h-3.5 w-3.5 text-[#e65f3c]" /> AI 핵심 요약</p><p className="max-w-2xl text-sm leading-7 text-black/65">{lead.summary}</p></div>
                <div className="mt-8 flex items-center justify-between"><div className="flex items-center gap-2 text-xs text-black/40"><span className="font-bold text-black/70">{lead.source}</span><span>·</span><span>{lead.time}</span></div><button onClick={() => toggleSave(lead.id)} className="grid h-10 w-10 place-items-center rounded-full border border-black/10 transition hover:bg-[#f4f4ef]" aria-label="기사 저장">{saved.includes(lead.id) ? <BookmarkCheck className="h-[18px] w-[18px] fill-[#171914]" /> : <Bookmark className="h-[18px] w-[18px]" />}</button></div>
              </div>
              <div className="relative hidden min-h-[420px] overflow-hidden bg-[#1d2928] lg:block">
                <div className="absolute -right-20 -top-10 h-72 w-72 rounded-full border-[48px] border-[#e65f3c]/90" />
                <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border-[65px] border-[#d6c892]/70" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" />
                <div className="absolute bottom-8 left-8 right-8 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Market signal</p><p className="mt-2 text-lg font-bold">금리 전망 변화가<br />시장을 움직입니다.</p></div>
              </div>
            </section>}

            {!showSaved && <section className="mt-12">
              <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-black/35">MY INTERESTS</p><h2 className="mt-1 text-xl font-black tracking-[-0.03em]">내 관심 키워드</h2></div><button onClick={() => setShowKeywordForm(!showKeywordForm)} className="flex items-center gap-1 text-xs font-bold text-black/55 hover:text-black"><Plus className="h-4 w-4" /> 키워드 추가</button></div>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => <span key={keyword} className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${index === 0 ? 'border-[#171914] bg-[#171914] text-white' : 'border-black/10 bg-white'}`}>{keyword}<button onClick={() => setKeywords((current) => current.filter((item) => item !== keyword))} className="opacity-35 transition hover:opacity-100" aria-label={`${keyword} 삭제`}><X className="h-3.5 w-3.5" /></button></span>)}
                {showKeywordForm && <form onSubmit={addKeyword} className="flex items-center rounded-full border border-[#e65f3c] bg-white pl-4 pr-1"><input autoFocus value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} className="w-24 bg-transparent text-sm outline-none" placeholder="키워드" /><button className="rounded-full bg-[#e65f3c] px-3 py-1.5 text-xs font-bold text-white">추가</button></form>}
              </div>
            </section>}

            <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_330px]">
              <div>
                <div className="mb-2 flex items-center justify-between"><h2 className="text-xl font-black tracking-[-0.03em]">{showSaved ? '보관한 기사' : activeCategory === '전체' ? '관심 키워드 주요 뉴스' : `${activeCategory} 주요 뉴스`}</h2><span className="text-xs text-black/35">{showSaved ? filtered.length : keywordNews.length}개 뉴스</span></div>
                <div className="divide-y divide-black/10">
                  {(showSaved ? filtered : keywordNews).map((article) => <article key={article.id} className="group grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0"><div className="mb-2 flex items-center gap-2"><span className="rounded bg-black/[0.06] px-2 py-1 text-[10px] font-black">{article.keyword ?? article.category}</span>{article.relevance && <span className="text-[10px] font-bold text-[#e65f3c]">관련도 {article.relevance}%</span>}</div><h3 className="text-lg font-black leading-snug tracking-[-0.025em] transition group-hover:text-[#e65f3c] sm:text-xl">{article.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-black/50">{article.summary}</p><div className="mt-3 flex items-center gap-2 text-[11px] text-black/35"><span className="font-bold text-black/60">{article.source}</span><span>·</span><Clock3 className="h-3 w-3" /><span>{article.time}</span><span>·</span><span>관련 기사 {article.cluster}개</span></div></div>
                    <button onClick={() => toggleSave(article.id)} className="justify-self-start rounded-full border border-black/10 p-2.5 transition hover:bg-white sm:justify-self-auto" aria-label="기사 저장">{saved.includes(article.id) ? <BookmarkCheck className="h-4 w-4 fill-[#171914]" /> : <Bookmark className="h-4 w-4" />}</button>
                  </article>)}
                  {(showSaved ? filtered : keywordNews).length === 0 && <div className="py-16 text-center"><Bookmark className="mx-auto h-8 w-8 text-black/20" /><p className="mt-3 text-sm font-bold text-black/45">{showSaved ? '아직 저장한 뉴스가 없습니다.' : '조건에 맞는 뉴스가 없습니다.'}</p></div>}
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-2xl bg-[#1d2928] p-6 text-white"><div className="flex items-center gap-2 text-xs font-bold text-[#d6c892]"><Landmark className="h-4 w-4" /> 금융 / 증권</div><div className="mt-5 space-y-5">{articles.filter((a) => a.category === '증권' || a.category === '산업').slice(0, 3).map((a, i) => <button key={a.id} onClick={() => setQuery(a.keyword ?? a.category)} className="flex w-full items-start gap-3 text-left"><span className="text-xs font-black text-white/25">0{i + 1}</span><span className="text-sm font-bold leading-5">{a.title}</span></button>)}</div><button onClick={() => setActiveCategory('증권')} className="mt-7 flex items-center gap-1 text-xs font-bold text-white/55 hover:text-white">증권 뉴스 전체보기 <ArrowRight className="h-3.5 w-3.5" /></button></div>
                <div className="rounded-2xl border border-black/10 bg-white p-6"><div className="flex items-center gap-2 text-xs font-bold text-[#178b72]"><Globe2 className="h-4 w-4" /> 글로벌 브리핑</div><h3 className="mt-4 text-lg font-black leading-snug">미 증시 상승 마감,<br />오늘 국내 영향은?</h3><p className="mt-3 text-sm leading-6 text-black/50">반도체 강세와 국채금리 하락이 국내 성장주에 긍정적으로 작용할 전망입니다.</p><button onClick={() => setActiveCategory('국제')} className="mt-5 flex items-center text-xs font-black">브리핑 읽기 <ChevronRight className="h-4 w-4" /></button></div>
              </aside>
            </section>
          </>
        ) : <div className="rounded-2xl border border-dashed border-black/15 py-24 text-center"><Search className="mx-auto h-8 w-8 text-black/20" /><p className="mt-4 font-bold text-black/45">검색 결과가 없습니다.</p><button onClick={() => { setQuery(''); setActiveCategory('전체'); setShowSaved(false) }} className="mt-4 text-sm font-bold text-[#e65f3c]">전체 뉴스로 돌아가기</button></div>}
      </main>
      <footer className="border-t border-black/10 px-5 py-8 text-center text-[11px] text-black/35">MYNEWS TERMINAL · 중요한 뉴스를 더 적게, 더 빠르게</footer>
    </div>
  )
}

export default App
