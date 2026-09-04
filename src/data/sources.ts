export type SourceDefinition = {
  id: string
  name: string
  description: string
  domain: string
  kind: '뉴스 RSS' | '키워드 검색' | '시세'
  requiresKey?: boolean
}

export const sourceDefinitions: SourceDefinition[] = [
  { id: 'hankyung-all', name: '한국경제 전체뉴스', description: '경제 중심 전체 기사', domain: 'hankyung.com', kind: '뉴스 RSS' },
  { id: 'hankyung-finance', name: '한국경제 증권', description: '증권·금융 기사', domain: 'hankyung.com', kind: '뉴스 RSS' },
  { id: 'hankyung-it', name: '한국경제 IT', description: 'IT·테크 기사', domain: 'hankyung.com', kind: '뉴스 RSS' },
  { id: 'mk-headline', name: '매일경제 헤드라인', description: '주요 헤드라인 기사', domain: 'mk.co.kr', kind: '뉴스 RSS' },
  { id: 'mk-international', name: '매일경제 국제', description: '국제 기사', domain: 'mk.co.kr', kind: '뉴스 RSS' },
  { id: 'mk-realestate', name: '매일경제 부동산', description: '부동산 기사', domain: 'mk.co.kr', kind: '뉴스 RSS' },
  { id: 'google-news', name: 'Google 뉴스', description: '내 관심 키워드 검색 결과', domain: 'news.google.com', kind: '키워드 검색' },
  { id: 'frankfurter', name: 'Frankfurter', description: 'USD/KRW 환율', domain: 'frankfurter.app', kind: '시세' },
  { id: 'upbit', name: '업비트', description: 'BTC/KRW 시세', domain: 'upbit.com', kind: '시세' },
  { id: 'finnhub', name: 'Finnhub', description: 'AAPL 주가', domain: 'finnhub.io', kind: '시세', requiresKey: true },
]

export const defaultSourceIds = sourceDefinitions.map((source) => source.id)
