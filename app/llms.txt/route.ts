import { CONTACT_EMAIL, HAS_CONTACT_EMAIL, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = `# Growth Brain

> Growth Brain은 AI를 바꿔도 일이 이어지게 하는 개인 업무 기억입니다. ChatGPT와 Claude를 오갈 때마다 처음부터 다시 설명하지 않도록, 일의 상태를 저장해 두었다가 다른 AI에서 바로 불러와 이어서 작업하게 합니다.

## 누구를 위한 서비스인가
- AI 두 개 이상을 업무에 쓰는 사람
- 한 프로젝트를 며칠, 몇 주씩 AI와 진행하는 사람
- 새 대화마다 배경 설명을 다시 하고 있는 사람

## 무엇을 해주나
대화 중 버튼 한 번으로 저장하면 아래 네 가지로 정리되고, 새 대화창이나 다른 AI에서 그대로 불러올 수 있습니다.
1. 현재 진행 상태
2. 주요 결정과 그 이유
3. 다음 작업
4. 관련 작업물

대화를 자동으로 수집하지 않으며, 저장 버튼을 누른 내용만 저장합니다. 저장된 내용은 AI 학습에 사용하지 않고 언제든 직접 삭제할 수 있습니다.

## 지원 AI
- 첫 베타: ChatGPT ↔ Claude 이어하기
- 다른 AI는 순차적으로 추가 예정

## 현재 상태
- 베타 대기 신청 중 (베타 기간 무료)
- 신청: ${SITE_URL}/#waitlist

## 링크
- 홈: ${SITE_URL}/
- 개인정보처리방침: ${SITE_URL}/privacy
${HAS_CONTACT_EMAIL ? `- 문의: ${CONTACT_EMAIL}\n` : ""}`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
