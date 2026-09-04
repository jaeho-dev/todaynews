import { AlertTriangle, ArrowLeft, Check, ExternalLink, KeyRound, RotateCcw, Rss, Search, TrendingUp } from 'lucide-react'
import { defaultSourceIds, externalReferences, sourceDefinitions } from '../data/sources'

type Props = {
  enabled: string[]
  onChange: (sources: string[]) => void
  onClose: () => void
}

const groups = ['뉴스 RSS', '키워드 검색', '시세'] as const

export function SourceManager({ enabled, onChange, onClose }: Props) {
  const toggle = (id: string) => onChange(enabled.includes(id) ? enabled.filter((item) => item !== id) : [...enabled, id])

  return <main className="mx-auto min-h-[calc(100vh-117px)] max-w-[1080px] px-5 pb-24 pt-10 sm:px-8 lg:pt-14">
    <button onClick={onClose} className="mb-8 flex items-center gap-2 text-sm font-bold text-black/50 hover:text-black"><ArrowLeft className="h-4 w-4" /> 뉴스 화면으로</button>
    <div className="flex flex-col justify-between gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e65f3c]">SOURCE SETTINGS</p><h1 className="text-3xl font-black tracking-[-0.05em] sm:text-5xl">연동 사이트 관리</h1><p className="mt-3 text-sm leading-6 text-black/50">사용할 데이터 제공처를 선택하세요. 설정은 이 브라우저에 자동 저장됩니다.</p></div>
      <div className="flex gap-2"><button onClick={() => onChange([])} className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold">모두 끄기</button><button onClick={() => onChange(defaultSourceIds)} className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold"><RotateCcw className="h-3.5 w-3.5" /> 기본값 복원</button></div>
    </div>

    <div className="mt-10 space-y-10">{groups.map((group) => <section key={group}><div className="mb-4 flex items-center gap-2">{group === '뉴스 RSS' ? <Rss className="h-4 w-4" /> : group === '키워드 검색' ? <Search className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}<h2 className="text-sm font-black">{group}</h2></div><div className="grid gap-3 sm:grid-cols-2">{sourceDefinitions.filter((source) => source.kind === group).map((source) => {
      const active = enabled.includes(source.id)
      return <button key={source.id} onClick={() => toggle(source.id)} className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${active ? 'border-[#171914] bg-white shadow-card' : 'border-black/10 bg-black/[0.025] opacity-55'}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${active ? 'bg-[#171914] text-white' : 'bg-black/10 text-black/35'}`}>{active ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-1.5 text-sm font-black">{source.name}{source.requiresKey && <KeyRound className="h-3.5 w-3.5 text-[#e65f3c]" />}</span><span className="mt-1 block text-xs text-black/45">{source.description} · {source.domain}</span></span><span className={`text-[10px] font-black ${active ? 'text-[#178b72]' : 'text-black/30'}`}>{active ? '사용 중' : '꺼짐'}</span></button>
    })}</div></section>)}</div>
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2"><ExternalLink className="h-4 w-4" /><h2 className="text-sm font-black">외부 참고 사이트</h2></div>
      <div className="grid gap-3 sm:grid-cols-2">{externalReferences.map((site) => <a key={site.id} href={site.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-5 text-left transition hover:border-black/30 hover:shadow-card"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/[0.06]"><ExternalLink className="h-4 w-4 transition group-hover:text-[#e65f3c]" /></span><span className="min-w-0 flex-1"><span className="text-sm font-black">{site.name}</span><span className="mt-1 block text-xs text-black/45">{site.description}</span><span className="mt-1 block truncate text-[10px] text-black/30">{site.url}</span></span>{site.status === 'ok' ? <span className="shrink-0 text-[10px] font-black text-[#178b72]">연결 확인</span> : <span className="flex shrink-0 items-center gap-1 text-[10px] font-black text-amber-700"><AlertTriangle className="h-3 w-3" />{site.status === 'browser-only' ? '브라우저 확인' : '주소 오류'}</span>}</a>)}</div>
      <p className="mt-3 text-[11px] leading-5 text-black/40">외부 참고 사이트는 데이터를 자동 수집하지 않으며 클릭하면 새 창에서 열립니다. Investing.com은 자동 요청을 차단하고, 한국IR협의회 일정 주소는 현재 외부 오류 페이지로 이동합니다.</p>
    </section>
    <div className="mt-10 rounded-2xl border border-amber-700/15 bg-amber-50 p-5 text-xs leading-6 text-amber-900"><strong>참고:</strong> Finnhub는 <code>FINNHUB_API_KEY</code>가 설정되어야 표시됩니다. 안전을 위해 검증되지 않은 RSS 주소를 직접 입력하는 기능은 제공하지 않습니다.</div>
  </main>
}
