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
