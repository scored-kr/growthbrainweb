// 클라이언트 전용 분석 헬퍼. 키가 없으면 전부 아무 일도 하지 않는다.
// 이메일 주소는 어떤 이벤트에도 넣지 않는다.

type CaptureClient = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
};

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || "";
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

export const posthogEnabled = POSTHOG_KEY.length > 0;

let client: CaptureClient | null = null;
const queue: Array<[string, Record<string, unknown> | undefined]> = [];

export function setAnalyticsClient(c: CaptureClient) {
  client = c;
  for (const [event, props] of queue.splice(0)) track(event, props);
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (!posthogEnabled) return;
  // 차단된 분석 스크립트나 SDK 오류가 신청 성공 UI를 오류로 바꾸지 않게 한다.
  if (client) {
    try {
      client.capture(event, properties);
    } catch {
      // 분석은 best effort이며 입력값/이메일을 로그에 남기지 않는다.
    }
  }
  else if (queue.length < 50) queue.push([event, properties]);
}

type Fbq = (...args: unknown[]) => void;

export function trackPixel(event: "Lead") {
  if (!META_PIXEL_ID || typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === "function") {
    try {
      fbq("track", event);
    } catch {
      // Pixel 오류도 폼 제출 결과에 영향을 주지 않는다.
    }
  }
}
