# 진행 기록

## 1차 — 섹션 + 폼 + Supabase 저장 + UTM + /privacy + 메타·OG·favicon + Netlify 설정
파일
- `package.json`, `tsconfig.json`, `next.config.mjs`, `netlify.toml`, `.env.example`
- `app/layout.tsx` (넥슨 Lv.1 고딕 next/font/local, 메타데이터·OG·canonical·lang=ko)
- `app/globals.css` (디자인 토큰 CSS 변수, 스무스 스크롤, scroll-margin, 포커스 링)
- `app/page.tsx`, `app/page.module.css` (섹션 12개)
- `components/SiteHeader.tsx`, `components/SiteFooter.tsx`, `components/site.module.css`
- `components/WaitlistForm.tsx`, `components/WaitlistForm.module.css`, `components/FaqList.tsx`, `components/icons.tsx`
- `app/actions.ts` (Server Action — Supabase REST 저장, 서버 전용 키)
- `lib/site.ts` (사이트 URL·문의 이메일 상수·FAQ), `lib/waitlist.ts`, `lib/attribution.ts`, `lib/analytics.ts`
- `app/privacy/page.tsx`, `lib/markdown.tsx` (content/privacy.md 그대로 렌더)
- `app/opengraph-image.tsx` (1200×630), `app/icon.svg`, `app/apple-icon.tsx`

메모
- Supabase 값 없음 → 저장 시도 없이 "신청이 저장되지 않았습니다…" 반환, 서버 로그 `SUPABASE env missing` 한 줄
- `WAITLIST_DRY_RUN=1` + 개발 모드 → 저장 없이 성공 (production 빌드에서는 무시)
- `form_submit`은 저장 성공 시점에 전송 (퍼널 끝 = 실제 신청 완료)
- 이메일은 소문자·공백 제거 후 저장, 대소문자 중복은 DB 인덱스가 막음(409 → "이미 신청된 이메일입니다.")
- 360px 줄바꿈: 시안 nowrap 외에 히어로 서브카피, 쓸수록 서브카피, 대기 신청 서브카피, 공감·이런 분께 리스트 끝 단어, 사용 방법 03, 마지막 CTA, 동의 라벨에 nowrap 묶음 추가
- 모바일(≤480px) 헤더: 로고·메뉴가 한 줄에 들어가도록 글자 크기·간격만 축소

## 2차 — 분석 (PostHog, Meta Pixel)
파일
- `components/Analytics.tsx` (레이아웃에 1회 마운트), `lib/analytics.ts`, `package.json`(posthog-js)

메모
- 키가 비어 있으면 posthog-js를 import하지 않고 Pixel 스크립트도 렌더하지 않음 (`NEXT_PUBLIC_*`는 빌드 시 박히므로 키 입력 후 재배포 필요)
- PostHog는 hydration 이후 동적 import, Pixel은 `next/script` afterInteractive
- 세션 녹화 `maskAllInputs: true` + 이메일 입력칸 `ph-no-capture`
- 이벤트: section_view(50% 이상 또는 화면 절반 이상 차지 시 1회), cta_click(header/hero/final_cta), form_start(첫 입력 1회), form_submit(ai_tools, has_other — 저장 성공 시), form_error(reason), faq_open(question)
- Pixel: PageView(로드 시), Lead(신청 성공 시)
- 이메일은 어떤 이벤트에도 넣지 않음

## 3차 — SEO/GEO
파일
- `app/sitemap.ts` (/, /privacy), `app/robots.ts` (전체 허용 + GPTBot·ClaudeBot·PerplexityBot·Google-Extended 등 명시 허용)
- `lib/jsonld.ts` + `app/page.tsx` 삽입: Organization(sameAs 생략), WebSite, SoftwareApplication(offers 생략), FAQPage(3개)
- `app/llms.txt/route.ts` — HANDOFF는 `public/llms.txt`지만, 사이트 URL·문의 이메일 상수를 같이 쓰려고 정적 라우트로 생성(`/llms.txt`로 똑같이 응답, 빌드 시 정적 생성)
- `public/logo.png` (Organization logo용 임시 512px, 로고 나오면 교체)

## 이전 구현 환경의 검증 기록 (아래 2026-11-06 결과로 보완됨)
- 확인: 360/390/768/1024/1440px 가로 스크롤 없음, 헤드라인·말풍선 한 단어 줄바꿈 없음, 사용 방법 카드 높이 동일·텍스트 세로 가운데(오차 ≤1px), 무엇이 이어지나 표 값 데스크톱 한 줄, 헤더 높이(81px, 모바일 65px) < scroll-margin 96px, 서버 액션 분기(환경변수 없음·dry run·중복·형식·동의·honeypot·500·타임아웃), 로그에 이메일 없음, 섹션 노출·CTA 이벤트 발생
  - 확인 방법: React 없이 TSX를 직접 렌더한 미리보기 HTML + Chromium (실제 next build 아님)
- 못 함: `npm install`·`next build`·Lighthouse — 작업 환경 네트워크 정책이 npm 레지스트리를 막아서. 첫 실제 빌드는 Netlify 배포 때 이뤄짐
- 남은 문제: 폰트 woff 3종이 각 430~460KB(한글 전체 글리프). Lighthouse Performance가 90에 못 미치면 woff2 변환·서브셋이 1순위 개선점

## 2026-11-06 실제 Next.js 실행 기반 보완

기존 1~3차 구현은 유지하고 다음 파일을 단계별로 보완·검증한다.
- 1차: `AGENTS.md`, `package.json`, `package-lock.json`, `tests/waitlist.test.cjs`, `tests/attribution.test.cjs`, 폼·유입 정보 코드(실제 결함 발견 시), `TODO_대표.md`.
- 2차: `components/Analytics.tsx`, `lib/analytics.ts`, `tests/analytics*.cjs` — 노출 기준·중복 이벤트·SDK 오류 격리.
- 3차: `tests/seo.test.cjs`, 필요 시 폰트 성능 개선, Lighthouse 및 실제 브라우저 검증 기록.
- 현재 저장소에 AGENTS.md가 없어 CLAUDE.md의 규칙을 Codex 진입점으로 정리했다. 원격은 `scored-kr/growthbrainweb`, 기존 브랜치는 `claude/new-session-hduyj3`이며 이 브랜치로 작업을 계속한다.

### 1차 보완 결과
- `AGENTS.md`와 개발 실행 안내(`START.md`) 추가·정리, 외부 설정 순서와 오래된 네트워크 차단 안내를 `TODO_대표.md`에서 갱신.
- Next.js 15.5.4 → 15.5.29 (메이저 유지). 전이 의존성 PostCSS 8.5.32, Sharp 0.35.5를 npm overrides로 고정해 확인된 취약점 패치. `package-lock.json`과 `npm test` 실행기를 추가.
- Supabase 오류 코드와 예외 이름을 허용된 형식으로 제한해 외부 오류 텍스트에 이메일이 있어도 로그에 남지 않도록 보완.
- 폼/유입 단위 회귀 테스트 17개 통과(저장 mock, 실제 외부 요청 없음). 실제 브라우저에서 키 누락 오류, 이메일/동의 검증, 주요 5개 경로 응답 통과.
- 실제 Next.js 화면의 360/768/1024/1440px 가로 스크롤 없음, H1 1개/본문 섹션 10개, 사용 방법 카드 높이 일치. 사전 개발 dry-run 성공 흐름도 확인.
- `npm audit --omit=dev`: 알려진 취약점 0개. 실제 Supabase 저장·권한 검증 및 Netlify 배포는 대표의 설정 후 진행.

### 2차 보완 결과
- `components/Analytics.tsx`: 문서의 섹션 50% 노출 기준을 정확히 적용하고 Strict Mode effect 재실행에서도 섹션 이벤트와 PostHog 초기화를 중복시키지 않음. 화면보다 매우 긴 섹션은 실제 50%가 보이기 전까지 기록하지 않음.
- PostHog 자동 폼 수집은 끄고 명시된 이벤트를 유지. 세션 녹화 입력값 마스킹 유지. SDK import/초기화 실패와 capture/Pixel 예외를 격리해 폼 결과에 영향을 주지 않음.
- `tests/analytics.test.cjs` 7개 통과: 빈 키, 이벤트 큐, 50% 노출·중복 방지, Strict Mode, 분석 SDK 실패, Pixel Lead 인수 확인. 실제 외부 분석 서버를 호출하지 않는 격리 테스트.
- 키 없이 외부 분석 스크립트를 로드하지 않는 동작은 유지. PostHog 대시보드·실제 녹화와 Meta PageView/Lead 수신은 키 입력 후 검증해야 함.

### 3차 보완 결과 / 최종 실행 검증
- `tests/seo.test.cjs` 5개 통과: JSON-LD의 Organization/WebSite/SoftwareApplication/FAQPage 연결, 화면 FAQ와 스키마 일치, 사이트 URL, sitemap, 주요 AI 크롤러 허용, llms.txt.
- Node.js 22.23.4에서 `npm ci`, `npm test` 총 29개(실패·스킵 0), `npm run build` 정적 페이지 11개 생성, `npm run typecheck` 통과. `git diff --check` 통과.
- 최종 프로덕션 브라우저 검증: OG ko_KR, Twitter 이미지, canonical(/ 및 /privacy), OG 1200×630 / Apple icon 180×180 PNG, CTA 3개→#waitlist 이동 후 헤더에 가리지 않음, 동의 자세히 4줄, AI 다중 선택·기타 자동 체크, FAQ 열림, 키 없이 PostHog/Pixel 요청 0건 통과.
- Lighthouse 13.6.0 모바일 기본 시뮬레이션, 로컬 프로덕션 `npm run start`, 2026-11-06 10:34 KST: **Performance 93 / Accessibility 100 / SEO 100**. FCP/LCP 0.9s, TBT 330ms, CLS 0. 이전 측정 97/100/100과 변동은 있으나 최종 측정도 요구된 90+ 통과.
- 보고서·브라우저 검증 로그는 현재 클라우드의 `/workspace/.growthbrain-validation/`에 보관. Lighthouse는 실제 배포·외부 분석 스크립트 활성화 후 재측정 필요.
- 공개 도메인의 리치 결과 테스트, 카카오톡/스레드 공유, 실제 Supabase 저장·RLS·분석 대시보드 수신은 실행하지 않음. 대표의 외부 설정 후 확인할 작업을 `TODO_대표.md`에 유지.
- 최종 개발 서버(`WAITLIST_DRY_RUN=1 npm run dev`)에서도 5개 경로와 신청 성공 UI를 실제 브라우저로 재확인. 페이지 오류 0개. 개발 서버를 실행해 둠.
- 기존 클라우드 환경 초안의 설치/시작 지침도 새 잠금 파일의 `npm ci`와 `npm test` 기준으로 갱신. 환경 게시와 Netlify 배포는 수행하지 않음.

### 문의 이메일 확정
- 사용자 지정 `htk3694@naver.com`을 `lib/site.ts`에 반영하고 `TODO_대표.md`에서 이메일 확정을 완료 처리.
- 확인 대상: 푸터 메일 링크, /privacy 본문, /llms.txt 문의 주소.
- SEO 회귀 테스트 5개 및 실행 중인 개발 서버의 홈·/privacy·/llms.txt 이메일 표시 검증 통과. 홈·개인정보 페이지의 mailto 링크 확인.
