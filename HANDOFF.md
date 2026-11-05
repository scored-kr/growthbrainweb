# Growth Brain 웨이트리스트 랜딩 — 구현 핸드오프

이 문서와 `design/landing-reference.dc.html`을 기준으로 랜딩을 구현한다.
디자인·카피는 확정본이다. 임의로 바꾸지 말고, 바꿔야 할 이유가 있으면 먼저 물어볼 것.

---

## 0. 작업 순서

1. Next.js 프로젝트 생성 → GitHub 저장소 푸시
2. 폰트·디자인 토큰 세팅
3. 섹션 컴포넌트 구현 (카피는 `design/landing-reference.dc.html`에서 그대로 가져옴)
4. 웨이트리스트 폼 + 저장
5. 분석(PostHog, Meta Pixel) + 이벤트
6. SEO / GEO
7. 개인정보처리방침 페이지
8. Netlify 배포, 도메인 연결
9. 체크리스트(맨 아래) 전부 통과 확인

### 0-1. 단계별 범위 (이 순서로 끊어서 배포)

- **1차 — 오늘 오픈**: 1~4번(섹션 전부 + 폼 + Supabase 저장 + UTM 저장), 7번 /privacy, title·description·OG 이미지·favicon, Netlify 배포. 여기까지 되면 스레드 고정글에 링크를 건다.
- **2차 — 11/12까지 (광고 11/16 시작 전)**: 5번 분석(PostHog, Meta Pixel). 키가 없으면 코드만 넣고 로드하지 않는다.
- **3차 — 도메인 연결 후**: 6번 나머지(sitemap, robots, JSON-LD, llms.txt), Lighthouse 점검.

---

## 1. 스택

- Next.js (App Router, TypeScript)
- 스타일: Tailwind CSS 또는 CSS Modules 중 택1 (디자인 토큰을 CSS 변수로 두고 사용)
- 폼 저장: Supabase (테이블 `waitlist`)
- 분석: PostHog (퍼널·세션 녹화), Meta Pixel (광고 대비)
- 배포: Netlify (Next.js는 Netlify가 자동 지원. Vercel 무료 플랜은 비상업용이라 쓰지 않는다)
- 랜딩 페이지는 정적 생성(SSG). 동적인 건 폼 제출(Server Action 또는 Route Handler)뿐

## 2. 참고 파일

- `design/landing-reference.dc.html`
  디자인 시안 원본. 사내 캔버스 포맷(`<x-dc>`, `support.js`, `/_blob/...` 폰트 경로)이라 그대로 열리진 않는다.
  **구조·카피·인라인 스타일 값을 읽어서 옮기는 용도**로만 쓴다. 이 파일의 마크업을 그대로 복붙하지 말 것.
- `fonts/` — 넥슨 Lv.1 고딕 woff 3종 (Light 300 / Regular 400 / Bold 700)

## 3. 폰트

- 페이지 전체를 넥슨 Lv.1 고딕 하나로만 구성
- `next/font/local`로 `fonts/` 3종 등록, `display: 'swap'`
- 폴백: `'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif`
- 이 폰트는 Medium이 없다. Regular(400)를 미디움 역할로 쓴다
- 웨이트 사용 규칙
  - 700: 헤드라인, 버튼, 라벨, 강조 숫자
  - 400: 본문 메인 문장(공감 리스트, 사용 방법, 이런 분께, 폼 옵션)
  - 300: 서브카피, 설명, 표 값, FAQ 답변
  - 일부 헤드라인은 한 문장 안에서 300 → 700 대비로 강조 (문제 섹션, 무엇이 이어지나, 마지막 CTA)
- 전역 `word-break: keep-all`

## 4. 디자인 토큰

| 이름 | 값 | 용도 |
|---|---|---|
| ink | #111827 | 기본 텍스트 |
| ink-2 | #374151 | 보조 텍스트 |
| muted | #4B5563 | 캡션 |
| line | #E5E7EB | 구분선 |
| line-2 | #DCE3EE | 카드 테두리 |
| primary | #0062F5 | 버튼·강조 (흰 글자 대비 4.5:1 이상) |
| primary-ink | #0052CC | 연한 파랑 배경 위 파란 글자 |
| primary-hover | #004BC0 | 링크 hover |
| tint | #F5F9FF | 섹션 배경 |
| tint-2 | #EEF5FF | 히어로 카드 영역·타임라인 배경 |
| chip | #E6F0FF | "이전 작업 불러옴" 칩 |
| bubble | #F3F4F6 | 대화 말풍선 |

- 컨테이너: max-width 1120px, 좌우 padding 24px
- 섹션 세로 padding: 112~120px (모바일에선 72~80px 정도로 축소)
- 라운드: 버튼 12px, 입력 10px, 카드 16~20px, 큰 배경 블록 24~32px
- 터치 타깃 최소 44px

### 타입 스케일 (시안 기준)
- 히어로 H1: clamp(36px, 5vw, 60px), 700, line-height 1.22, letter-spacing -0.035em
- 섹션 H2: clamp(28~32px, 3.4~4.2vw, 42~54px), line-height 1.25~1.4, letter-spacing -0.03em (섹션별 값은 시안 그대로)
- 섹션 라벨(파란 작은 글씨): 17px, 700
- 서브카피·리스트 본문: 21px
- 표: 라벨 17px 700 / 값 17px 300
- FAQ 질문 19px 400 / 답변 17px 300

## 5. 섹션 구성 (위→아래)

카피는 시안 파일의 텍스트를 그대로 사용.

1. **헤더** — 텍스트 로고 "Growth Brain"(로고 이미지 나오면 교체), 사용 방법 / FAQ / 베타 신청 버튼
   - `position: sticky; top: 0`, 반투명 흰 배경 + `backdrop-filter: blur(12px)`
2. **히어로** — 좌: H1 + 서브카피 + "한 달에 5시간"(굵게·파랑) + CTA / 우: ChatGPT(어제) → Claude(오늘) 대화 카드 2개 + 연결 화살표
   - 대화 카드의 AI 표시는 공식 로고 쓰지 말고 단색 칩(시안처럼)
   - 말풍선 문구는 두 덩어리로 묶어 `white-space: nowrap` 처리 → 넓으면(태블릿) 한 줄, 좁으면 정해진 지점에서만 두 줄
3. **이런 순간, 익숙한가요?** (tint 배경) — 아이콘 + 문장 3줄, 사이 구분선
4. **문제** — "AI가 부족한 게 아닙니다. / 일의 맥락이 매번 끊기는 겁니다."
5. **사용 방법** (`id="how"`, tint 배경) — 01/02/03 카드 3개
   - 카드 높이 동일, 텍스트 영역 min-height 2줄 + 세로 가운데 정렬 (01·03 한 줄, 02 두 줄이 가운데 높이로 맞아야 함)
6. **무엇이 이어지나** — 좌: 라벨+H2+서브카피 / 우: "신규 프로젝트 제안서 작성" 상태 카드(4행 표). 모바일은 세로로 쌓임
7. **쓸수록 똑똑해진다** — 월(ChatGPT·저장) / 화(ChatGPT·저장) / 수(Claude·불러옴, 파란 카드) 타임라인
8. **이런 분께** (tint 배경) — 3줄
9. **베타 대기 신청** (`id="waitlist"`) — 좌: 카피 / 우: 폼
10. **FAQ** (`id="faq"`) — 아코디언 3개
11. **마지막 CTA** (primary 배경)
12. **푸터** — 텍스트 로고, 개인정보처리방침 링크, 문의 이메일, ©

### 헤드라인 줄바꿈 규칙
모바일에서 단어 하나만 다음 줄로 떨어지지 않게, 의미 단위를 `white-space: nowrap` span으로 묶는다. 시안에 적용된 곳: 문제 H2, 사용 방법 H2, 히어로 말풍선 2개. 다른 헤드라인도 360px 폭에서 확인하고 필요하면 같은 방식 적용.

## 6. 인터랙션

- 모든 "베타 대기 신청하기"·"베타 신청" → `#waitlist`로 부드럽게 스크롤
  - `html { scroll-behavior: smooth }`, `[id] { scroll-margin-top: 96px }` (sticky 헤더에 안 가리게)
  - `prefers-reduced-motion: reduce`면 즉시 이동
- FAQ: 아코디언(`<details>` 또는 버튼+aria-expanded). 열림 시 + 아이콘 회전/− 전환
- 그 외 섹션 등장 애니메이션은 넣지 않는다 (과한 모션 금지)
- 키보드 포커스 링 보이게

## 7. 웨이트리스트 폼

필드
- 이메일 (필수, type=email)
- 주로 쓰는 AI (체크박스, **중복 선택 가능**): ChatGPT / Claude / Gemini / 기타
- 기타 입력칸: 기본 숨김 → "기타" 체크 시 열림. 입력칸에 타이핑하면 "기타" 자동 체크
- **개인정보 수집·이용 동의 체크박스 (필수, 기본 해제)** — 시안의 "신청 시 … 동의한 것으로 간주합니다." 문구는 쓰지 않는다. 개인정보보호법상 간주 동의는 효력이 약해서 체크박스 + 고지로 바꾼다. 시안 카피 중 이 부분만 변경 허용.
  - 라벨: "[필수] 개인정보 수집·이용에 동의합니다." + "자세히" 토글
  - "자세히"를 열면 4줄 표시
    - 수집 항목: 이메일, 주로 쓰는 AI, 유입 경로
    - 이용 목적: 베타 오픈 안내, 서비스 개선을 위한 통계
    - 보유 기간: 베타 종료 후 6개월 또는 삭제 요청 시까지
    - 동의를 거부할 수 있으며, 거부 시 베타 대기 신청이 제한됩니다.
  - 그 아래 작은 글씨로 개인정보처리방침 링크
  - 미체크 제출 시: "개인정보 수집·이용에 동의해 주세요."

동작
- 제출 중 버튼 비활성 + "신청 중…"
- 성공: 폼 자리에 완료 메시지 ("신청이 완료됐습니다. 베타가 열리면 이 이메일로 가장 먼저 알려드릴게요.")
- 실패 메시지는 원인과 해결을 말한다
  - 이메일 형식 오류: "이메일 형식을 확인해 주세요."
  - 중복: "이미 신청된 이메일입니다."
  - 서버 오류: "신청이 저장되지 않았습니다. 잠시 후 다시 시도해 주세요."
- 스팸 방지: honeypot 필드 1개 + 이메일 중복 제약. (서버리스라 메모리 기반 rate limit은 안 먹힌다. 1차는 이 둘로 충분)

Supabase 테이블 `waitlist`
```
id          uuid primary key default gen_random_uuid()
email       text unique not null
ai_tools    text[] not null default '{}'   -- chatgpt, claude, gemini, other
ai_other    text
utm_source  text
utm_medium  text
utm_campaign text
referrer    text
consent_at  timestamptz not null default now()  -- 동의 시각
created_at  timestamptz default now()
```
- 테이블은 `supabase/waitlist.sql`로 대표가 직접 만든다 (대소문자 무시 중복 방지 인덱스 포함)
- RLS 켜고, insert는 서버(Service Role)에서만
- UTM·referrer는 첫 진입 시 URL에서 읽어 폼과 함께 저장 (스레드 고정글·인스타 바이오 링크 성과 구분용)

## 8. 분석

PostHog
- 페이지뷰 자동 수집 + 세션 녹화 ON (이메일 입력칸은 마스킹)
- 섹션 노출 이벤트: IntersectionObserver, 섹션이 50% 이상 보이면 1회만 전송
  - `section_view` + `{ section: 'hero' | 'pain' | 'problem' | 'how' | 'carryover' | 'smarter' | 'audience' | 'waitlist' | 'faq' | 'final_cta' }`
- `cta_click` + `{ location: 'header' | 'hero' | 'final_cta' }`
- `form_start` (폼 첫 입력 시 1회)
- `form_submit` + `{ ai_tools, has_other }` (이메일은 이벤트에 넣지 않음)
- `form_error` + `{ reason }`
- `faq_open` + `{ question }`
- 대시보드: hero → how → waitlist → form_start → form_submit 퍼널

Meta Pixel
- 광고는 대행사(도슨티)가 집행한다. 우리 Pixel을 쓰는지 대행사 Pixel ID를 받는지 확인 후 넣는다
- PageView, 폼 성공 시 `Lead`
- 픽셀 ID는 환경변수. 값 없으면 로드하지 않음

## 9. SEO

- `metadata`
  - title: "Growth Brain — AI를 바꿔도 일이 이어지는 개인 업무 기억"
  - description: "ChatGPT와 Claude를 오갈 때마다 처음부터 다시 설명하지 마세요. 현재 상태·결정과 이유·다음 할 일을 저장하고 다른 AI에서 바로 이어서 작업합니다. 베타 대기 신청 중."
  - canonical, `lang="ko"`, `og:locale` ko_KR
- Open Graph / Twitter 카드 + OG 이미지 1200×630 (히어로 헤드라인 + 대화 카드 구성, `next/og`로 생성 가능)
- `app/sitemap.ts`, `app/robots.ts`
- 시맨틱 마크업: h1 1개, 섹션마다 h2, 리스트는 ul/li, 표는 dl 또는 table
- 이미지·아이콘 SVG는 장식이면 `aria-hidden`
- Core Web Vitals: 폰트 preload(Bold, Regular), 레이아웃 시프트 없게 폰트 폴백 메트릭 조정, 서드파티 스크립트(PostHog, Pixel)는 `afterInteractive` 이후 로드
- favicon / apple-touch-icon (로고 나오면 교체, 일단 텍스트 기반 임시)

## 10. GEO (AI 검색 노출)

- JSON-LD
  - `Organization` (name, url, logo, sameAs: 스레드·인스타 계정 URL)
  - `WebSite`
  - `SoftwareApplication` (applicationCategory: BusinessApplication, operatingSystem: Web, offers는 가격 확정 전이면 생략)
  - `FAQPage` (FAQ 3개, 답변 확정된 것만)
- `public/llms.txt` — 서비스 한 줄 정의, 누구를 위한 건지, 무엇을 해주는지(4가지 이어지는 정보), 지원 AI, 현재 상태(베타 대기), 신청 URL. 과장 없이 사실만
- `robots.ts`에서 주요 AI 크롤러(GPTBot, ClaudeBot, PerplexityBot, Google-Extended 등) 허용
- 본문에 "Growth Brain은 ~이다" 같은 정의 문장이 텍스트로 존재해야 함 (사용 방법 H2가 그 역할. 이미지로 만들지 말 것)

## 11. 개인정보처리방침 (`/privacy`)

`content/privacy.md` 내용을 그대로 `/privacy` 페이지로 만든다. 문의 이메일 자리(`[문의 이메일]`)만 환경변수 또는 상수로 채운다.

## 12. 환경변수

```
NEXT_PUBLIC_SITE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_META_PIXEL_ID=
```
`.env.example`로 커밋, 실제 값은 Netlify 환경변수에만.
선택: `OPENAI_API_KEY` (Codex 위임용, 앱 코드에서는 쓰지 않음)

## 13. 확정값과 남은 값

FAQ 답변 (시안에 반영됨, JSON-LD FAQPage에도 그대로 사용)
- 내 대화가 어디에 저장되나요? → 저장 버튼을 누른 내용만 저장합니다. 대화를 자동으로 수집하지 않고, 저장된 내용은 암호화된 클라우드 데이터베이스에 보관됩니다. AI 학습에는 사용하지 않으며, 언제든 직접 삭제할 수 있습니다.
- 무료인가요? → 베타 기간에는 무료입니다. 정식 출시 후에도 무료 버전은 유지되고, 대기 신청자에게는 유료 플랜 초기 혜택을 드립니다.
- 어떤 AI를 지원하나요? → 첫 베타는 ChatGPT와 Claude 사이의 이어하기부터 지원합니다. 다른 AI는 순차적으로 추가할 예정입니다.

기타 확정
- 로고: 당분간 텍스트 로고 "Growth Brain" (이미지 나오면 교체)
- 도메인: growthbrain.co.kr. DNS 연결 전까지는 netlify.app 주소로 배포
- SNS(sameAs): 계정 URL 생기기 전까지 Organization JSON-LD에서 sameAs 생략
- 개인정보 보관 기간·보호책임자: content/privacy.md에 반영

남은 값 (상수 하나로 관리)
- 문의 이메일 → 푸터, /privacy, llms.txt에서 같은 상수 사용

## 14. 완료 체크리스트

- [ ] 360 / 768 / 1024 / 1440px에서 레이아웃 깨짐 없음, 가로 스크롤 없음
- [ ] 헤드라인·말풍선이 단어 하나만 떨어지는 줄바꿈 없음
- [ ] 사용 방법 3칸 텍스트가 세로 가운데로 맞음
- [ ] 무엇이 이어지나 표 값이 데스크톱에서 한 줄
- [ ] 모든 CTA → #waitlist 부드러운 스크롤, 헤더에 안 가림
- [ ] 폼: 중복 선택, 기타 입력 열림/자동 체크, 성공·오류 메시지, 중복 이메일 처리
- [ ] Supabase에 UTM 포함 저장 확인
- [ ] PostHog 이벤트 전부 들어옴, 퍼널 생성, 이메일 마스킹 확인
- [ ] Pixel PageView·Lead 확인 (ID 있을 때)
- [ ] Lighthouse 모바일 Performance·SEO·Accessibility 90+
- [ ] JSON-LD 유효성(구글 리치 결과 테스트), sitemap·robots·llms.txt 응답
- [ ] OG 이미지 카카오톡·스레드 공유 미리보기 확인
- [ ] /privacy 페이지, 푸터·폼 링크 연결
- [ ] 동의 체크박스 미체크 시 제출 막힘, "자세히" 고지 4줄 표시, consent_at 저장
- [ ] Supabase 리전 서울, RLS 켜짐, anon 키로 insert 안 됨
