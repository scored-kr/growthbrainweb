// 클라이언트·서버 공용 (비밀 값 없음)

export const AI_TOOLS = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "other", label: "기타" },
] as const;

export type AiTool = (typeof AI_TOOLS)[number]["value"];

export const MESSAGES = {
  invalid_email: "이메일 형식을 확인해 주세요.",
  consent: "개인정보 수집·이용에 동의해 주세요.",
  duplicate: "이미 신청된 이메일입니다.",
  server: "신청이 저장되지 않았습니다. 잠시 후 다시 시도해 주세요.",
} as const;

export type WaitlistErrorReason = keyof typeof MESSAGES;

export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: WaitlistErrorReason; message: string };

export type WaitlistInput = {
  email: string;
  aiTools: string[];
  aiOther: string;
  consent: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
  /** honeypot — 사람은 비워둔다 */
  company?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function isAiTool(value: string): value is AiTool {
  return AI_TOOLS.some((t) => t.value === value);
}
