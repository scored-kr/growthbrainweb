# 오늘 (외부 설정 없이 개발만)

1. 이 폴더를 클로드 코드에서 연다 (GitHub 리포에 올려서 열어도 되고, 로컬 폴더로 열어도 됨)
2. 아래 첫 메시지를 그대로 보낸다

> CLAUDE.md와 HANDOFF.md 읽고 1차부터 3차까지 코드로 끝까지 구현해. Supabase·PostHog·Pixel 키는 아직 없으니까 CLAUDE.md 규칙대로 값 없을 때 안전하게 동작하게 만들고 멈추지 말고 진행해. 내가 직접 해야 하는 건 TODO_대표.md에 순서대로 정리하고, 단계마다 커밋하고 보고해.

# 내일 (15분)

클로드 코드가 만든 TODO_대표.md 순서대로 하면 된다. 대략 이 순서:
1. Supabase 새 프로젝트 (리전 Seoul) → SQL Editor에 supabase/waitlist.sql 실행
2. GitHub 리포 → Netlify Import → Netlify 환경변수 입력
3. 클로드 코드에 "키 넣었어. TODO_대표.md에 남긴 체크리스트 확인해" 보내기
4. 배포 주소에서 테스트 등록 1건 → Supabase 테이블에 들어왔는지 확인
