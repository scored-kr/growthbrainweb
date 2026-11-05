export const SITE_NAME = "Growth Brain";

// 도메인 연결 전: netlify.app 주소 / 연결 후: https://growthbrain.co.kr
// NEXT_PUBLIC_SITE_URL이 비어 있으면 Netlify가 빌드 때 넣어주는 URL을 쓴다.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");

// 문의 이메일 — 푸터, /privacy, llms.txt가 모두 이 상수 하나를 쓴다.
// TODO(대표): 실제 문의 이메일로 교체 (TODO_대표.md 참고)
export const CONTACT_EMAIL = "[문의 이메일]";
export const HAS_CONTACT_EMAIL = CONTACT_EMAIL.includes("@");

export const SITE_TITLE = "Growth Brain — AI를 바꿔도 일이 이어지는 개인 업무 기억";
export const SITE_DESCRIPTION =
  "ChatGPT와 Claude를 오갈 때마다 처음부터 다시 설명하지 마세요. 현재 상태·결정과 이유·다음 할 일을 저장하고 다른 AI에서 바로 이어서 작업합니다. 베타 대기 신청 중.";

export const FAQS = [
  {
    question: "내 대화가 어디에 저장되나요?",
    answer:
      "저장 버튼을 누른 내용만 저장합니다. 대화를 자동으로 수집하지 않고, 저장된 내용은 암호화된 클라우드 데이터베이스에 보관됩니다. AI 학습에는 사용하지 않으며, 언제든 직접 삭제할 수 있습니다.",
  },
  {
    question: "무료인가요?",
    answer:
      "베타 기간에는 무료입니다. 정식 출시 후에도 무료 버전은 유지되고, 대기 신청자에게는 유료 플랜 초기 혜택을 드립니다.",
  },
  {
    question: "어떤 AI를 지원하나요?",
    answer:
      "첫 베타는 ChatGPT와 Claude 사이의 이어하기부터 지원합니다. 다른 AI는 순차적으로 추가할 예정입니다.",
  },
] as const;
