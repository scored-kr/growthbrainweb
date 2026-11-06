# 개발 시작

Node.js 22를 사용한다. `AGENTS.md`, `HANDOFF.md`, `PROGRESS.md`를 읽는다.

```bash
npm ci
npm test
npm run typecheck
WAITLIST_DRY_RUN=1 npm run dev
```

`WAITLIST_DRY_RUN=1`은 개발 모드에서 실제 저장 없이 성공 UI를 확인하는 용도다. 값이 없고 Supabase도 설정되지 않았다면 폼은 지정된 저장 오류를 보여준다. PostHog·Pixel 키가 없으면 외부 스크립트를 로드하지 않는다.

프로덕션 확인 시 실행 중인 개발 서버를 종료하고 다음을 실행한다.

```bash
npm run build
npm run start
```

production에서는 `WAITLIST_DRY_RUN`을 무시한다. 실제 저장은 Supabase 설정이 필요하며 비밀키는 서버 환경변수에만 둔다. 예시는 `.env.example`을 참고하고 실제 `.env.local`은 커밋하지 않는다.

# 배포 준비

저장소: https://github.com/scored-kr/growthbrainweb

작업 브랜치: `claude/new-session-hduyj3`

`TODO_대표.md` 순서대로 문의 이메일, Supabase, Netlify, 분석, 도메인을 설정한다. 키를 넣은 뒤 재배포하고 실제 저장·이벤트 수신을 확인한다. 단계별 코드 작업과 로컬 검증 결과는 `PROGRESS.md`에 기록한다.
