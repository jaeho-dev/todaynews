export type SourceDefinition = {
  id: string
  name: string
  description: string
  domain: string
  kind: '뉴스 RSS' | '키워드 검색' | '시세'
  requiresKey?: boolean
}

export const sourceDefinitions: SourceDefinition[] = [
  { id: 'mk-headline', name: '매일경제 헤드라인', description: '주요 헤드라인 기사', domain: 'mk.co.kr', kind: '뉴스 RSS' },
  { id: 'mk-international', name: '매일경제 국제', description: '국제 기사', domain: 'mk.co.kr', kind: '뉴스 RSS' },
  { id: 'mk-realestate', name: '매일경제 부동산', description: '부동산 기사', domain: 'mk.co.kr', kind: '뉴스 RSS' },
  { id: 'google-news', name: 'Google 뉴스', description: '내 관심 키워드 검색 결과', domain: 'news.google.com', kind: '키워드 검색' },
  { id: 'frankfurter', name: 'Frankfurter', description: 'USD/KRW 환율', domain: 'frankfurter.app', kind: '시세' },
  { id: 'upbit', name: '업비트', description: 'BTC/KRW 시세', domain: 'upbit.com', kind: '시세' },
  { id: 'finnhub', name: 'Finnhub', description: 'AAPL 주가', domain: 'finnhub.io', kind: '시세', requiresKey: true },
]

export const defaultSourceIds = sourceDefinitions.map((source) => source.id)

export type ExternalReference = {
  id: string
  name: string
  url: string
  description: string
  status: 'ok' | 'browser-only' | 'redirect-error'
}

export const externalReferences: ExternalReference[] = [
  { id: 'bigkinds', name: '빅카인즈', url: 'https://www.bigkinds.or.kr', description: '뉴스 빅데이터 분석', status: 'ok' },
  { id: 'dealsite', name: '딜사이트', url: 'https://dealsite.co.kr', description: '자본시장 전문 미디어', status: 'ok' },
  { id: 'thebell', name: '더벨', url: 'https://www.thebell.co.kr/front/index.asp', description: '자본시장 전문 미디어', status: 'ok' },
  { id: 'theguru', name: '더구루', url: 'https://www.theguru.co.kr/news/section_list_all.html?sec_no=26', description: '기업·글로벌 뉴스', status: 'ok' },
  { id: 'investing', name: 'Investing.com', url: 'https://kr.investing.com', description: '글로벌 금융시장 정보', status: 'browser-only' },
  { id: 'kirs', name: '한국IR협의회', url: 'https://www.kirs.or.kr/support/schedule.html', description: 'IR 일정', status: 'redirect-error' },
  { id: 'naver-research', name: '네이버 금융 리서치', url: 'https://finance.naver.com/research/', description: '증권사 리서치 자료', status: 'ok' },
]
