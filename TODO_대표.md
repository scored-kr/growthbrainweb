# 대표가 직접 할 일 (순서대로)

> 코드는 1~3차 모두 들어가 있음. 아래는 외부 대시보드·계정 작업만.
> 비밀 키는 이 파일·코드·커밋 어디에도 적지 말 것. Netlify 환경변수와 로컬 `.env.local`에만.

## 0. 지금 바로 (보안)
- [ ] **OpenAI API 키 폐기·재발급** — 이번 작업 중 `.env.local` 파일이 채팅에 첨부되면서 키 값이 노출됨. platform.openai.com > API keys 에서 기존 키 Revoke → 새로 발급 → 사용 한도(Usage limits) 설정. 앱 코드는 이 키를 쓰지 않으므로 Netlify에는 넣지 않아도 됨.

## 0-1. (선택) 작업 환경 네트워크 열기
- [ ] 이번 클라우드 작업 환경은 npm 레지스트리 접속이 막혀 있어서 `next build`를 직접 못 돌렸음. claude.ai/code 세션 제목 옆 환경 메뉴 → Edit → Network access 에서 `registry.npmjs.org` 허용(또는 더 넓은 수준 선택)하면, 다음 세션에서 빌드·타입체크·Lighthouse까지 돌려서 확인 가능
- [ ] 허용 안 해도 Netlify가 배포 때 빌드함. 첫 배포 로그(Deploys > 해당 배포 > Deploy log)에 빌드 에러가 있으면 그 로그를 클로드 코드에 붙여넣기

## 1. 문의 이메일 정하기 (링크 공개 전 필수)
- [ ] 문의 이메일 주소를 정해서 알려주기 → `lib/site.ts`의 `CONTACT_EMAIL` 한 줄만 바꾸면 푸터·/privacy·llms.txt에 같이 반영됨
  - 지금은 `[문의 이메일]`이 그대로 보임. 개인정보처리방침 9항(보호책임자 연락처)에 필요하므로 링크 공개 전에 꼭 채울 것

## 2. Supabase
- [ ] supabase.com → New project, **Region: Northeast Asia (Seoul) ap-northeast-2**
- [ ] SQL Editor → `supabase/waitlist.sql` 통째로 붙여넣고 Run
- [ ] Table Editor에서 `waitlist` 테이블 확인, **RLS enabled** 표시 확인 (정책은 0개가 정상)
- [ ] Project Settings > API(Data API)에서 `Project URL`, `service_role` 키 복사 (anon 키 아님)

## 3. GitHub → Netlify
- [ ] 코드는 브랜치 `claude/new-session-hduyj3`에 푸시돼 있음. GitHub에서 이 브랜치를 `main`으로 머지(PR 생성 후 Merge)하거나, 저장소 기본 브랜치를 확인
- [ ] app.netlify.com → Add new site → Import from Git → `scored-kr/growthbrainweb` 선택, Branch to deploy: `main`
  - 빌드 설정은 `netlify.toml`이 자동으로 채움 (build: `npm run build`, Node 22)
- [ ] Site configuration > Environment variables 에 입력 (**입력 후 Deploys > Trigger deploy > Clear cache and deploy** — `NEXT_PUBLIC_` 값은 빌드 때 박히므로 재배포해야 반영됨)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SITE_URL` = 지금은 `https://<사이트이름>.netlify.app`, 도메인 연결 후 `https://growthbrain.co.kr`
  - (2차) `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
  - (2차) `NEXT_PUBLIC_META_PIXEL_ID`
  - `WAITLIST_DRY_RUN`은 **넣지 말 것** (production에서는 어차피 무시되지만 혼동 방지)
- [ ] 배포 주소에서 테스트 신청 1건 (`?utm_source=test&utm_medium=manual&utm_campaign=check` 붙여서 접속) → Supabase 테이블에 행 + utm 값 + consent_at 들어왔는지 확인
- [ ] 같은 이메일로 한 번 더 → "이미 신청된 이메일입니다." 확인
- [ ] 저장이 안 되면: Netlify 환경변수 이름 오타 / 재배포 안 함 / service_role 대신 anon 키 넣음 — 이 셋부터 확인
- [ ] 스레드 고정글·인스타 바이오 링크에 UTM 붙여서 걸기 (예: `?utm_source=threads&utm_medium=social&utm_campaign=pinned`, `?utm_source=instagram&utm_medium=social&utm_campaign=bio`)

## 4. 2차 — 분석 (11/12까지)
- [ ] PostHog 가입 → 프로젝트 생성 → Project API key, 호스트(US: `https://us.i.posthog.com` / EU: `https://eu.i.posthog.com`)를 Netlify 환경변수에 입력 → 재배포
- [ ] PostHog Settings > Session replay 켜기
- [ ] PostHog에서 퍼널 만들기: `section_view (section=hero)` → `section_view (section=how)` → `section_view (section=waitlist)` → `form_start` → `form_submit`
- [ ] 도슨티에 확인: 우리 Pixel을 쓸지, 대행사 Pixel ID를 받을지 → ID를 `NEXT_PUBLIC_META_PIXEL_ID`에 입력 → 재배포
- [ ] 그 다음 클로드 코드에 "키 넣었어. TODO_대표.md에 남긴 체크리스트 확인해" 보내기

## 5. 3차 — 도메인
- [ ] Netlify > Domain management > Add domain `growthbrain.co.kr` → 안내되는 DNS 레코드를 도메인 업체(가비아 등)에 입력 → HTTPS 인증서 자동 발급 대기
- [ ] `NEXT_PUBLIC_SITE_URL`을 `https://growthbrain.co.kr`로 바꾸고 재배포 (canonical·sitemap·OG·JSON-LD 주소가 바뀜)
- [ ] Google Search Console에 도메인 등록 → `https://growthbrain.co.kr/sitemap.xml` 제출
- [ ] 스레드·인스타 계정 URL이 생기면 알려주기 → Organization JSON-LD의 sameAs에 추가
- [ ] 로고 이미지가 나오면 전달 → 헤더 텍스트 로고·favicon 교체

## 6. 키 넣은 뒤 확인할 체크리스트 (HANDOFF 14번 중 외부 키가 필요한 항목)
- [ ] Supabase에 UTM 포함 저장 확인
- [ ] 동의 체크 후 저장 시 consent_at 값 확인
- [ ] Supabase 리전 서울, RLS 켜짐, anon 키로 insert 안 됨 (anon 키로 insert 시도 → 401/403 이어야 정상)
- [ ] PostHog 이벤트 전부 들어옴(section_view, cta_click, form_start, form_submit, form_error, faq_open), 퍼널 생성, 세션 녹화에서 이메일 칸 마스킹 확인
- [ ] Pixel PageView·Lead 확인 (Meta Events Manager > Test events)
- [ ] OG 이미지 카카오톡·스레드 공유 미리보기 확인 (카카오는 developers.kakao.com/tool/debugger/sharing 에서 캐시 초기화)
- [ ] Lighthouse 모바일 Performance·SEO·Accessibility 90+ (배포 주소로 PageSpeed Insights 실행)
- [ ] JSON-LD 유효성: search.google.com/test/rich-results 에 배포 주소 입력
- [ ] sitemap.xml · robots.txt · llms.txt 응답 확인
