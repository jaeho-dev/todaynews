# TodayNews

관심 키워드의 최신 뉴스와 주요 시세를 한 화면에서 확인하는 개인 대시보드입니다.

## 현재 구현

- 한국경제·매일경제 RSS 통합, 중복 제거, 최신순 정렬
- Google 뉴스 RSS 기반 관심 키워드 검색
- 키워드 `localStorage` 저장 및 `?k=` URL 공유
- USD/KRW 환율, BTC/KRW 시세와 선택적 Finnhub 주식 시세
- 기사 검색·카테고리 필터·저장·원문 링크
- Vercel CDN 캐시 및 매체별 부분 실패 처리

## 로컬 실행

일반 개발 환경에서는 Vite가 로컬 API를 함께 실행합니다.

```bash
npm run dev
```

Vercel과 동일한 서버리스 환경을 검증하려면 Vercel CLI를 사용할 수 있습니다.

```bash
npx vercel dev
```

## 환경변수

`.env.example`을 참고해 Vercel 프로젝트 설정에 추가합니다.

- `FINNHUB_API_KEY`: 설정하면 AAPL 시세가 시세판에 추가됩니다.
- `ANTHROPIC_API_KEY`: AI 요약 기능을 활성화할 때 사용합니다.
- `ANTHROPIC_MODEL`: 요약에 사용할 모델명입니다.

AI 요약 API는 공개 배포에서의 비용 보호를 위해 호출 제한 정책을 정한 뒤 활성화하도록 비활성 상태로 두었습니다.
