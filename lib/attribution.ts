// 첫 진입 시 UTM·referrer를 읽어 세션에 보관 (스레드 고정글·인스타 바이오 링크 성과 구분용)

export type Attribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
};

const KEY = "gb_attribution";

function read(): Attribution | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

function externalReferrer(): string | null {
  const ref = document.referrer;
  if (!ref) return null;
  try {
    return new URL(ref).host === window.location.host ? null : ref;
  } catch {
    return null;
  }
}

/** 첫 진입 값을 저장하고 돌려준다. 이미 저장돼 있으면 그대로 돌려준다. */
export function captureAttribution(): Attribution {
  const saved = read();
  if (saved) return saved;
  const params = new URLSearchParams(window.location.search);
  const attr: Attribution = {
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    referrer: externalReferrer(),
  };
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(attr));
  } catch {
    // 저장이 막혀 있어도 이번 페이지 값은 그대로 쓴다
  }
  return attr;
}
