"use server";

import {
  MESSAGES,
  isAiTool,
  isValidEmail,
  type WaitlistErrorReason,
  type WaitlistInput,
  type WaitlistResult,
} from "@/lib/waitlist";

function fail(reason: WaitlistErrorReason): WaitlistResult {
  return { ok: false, reason, message: MESSAGES[reason] };
}

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().slice(0, max);
  return v.length > 0 ? v : null;
}

export async function submitWaitlist(input: WaitlistInput): Promise<WaitlistResult> {
  // honeypot: 봇이면 저장하지 않고 성공처럼 응답
  if (typeof input?.company === "string" && input.company.trim() !== "") {
    return { ok: true };
  }

  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) return fail("invalid_email");
  if (input?.consent !== true) return fail("consent");

  const aiTools = Array.from(
    new Set((Array.isArray(input.aiTools) ? input.aiTools : []).filter(
      (t): t is string => typeof t === "string" && isAiTool(t),
    )),
  );
  const aiOther = aiTools.includes("other") ? clean(input.aiOther, 100) : null;

  const row = {
    email,
    ai_tools: aiTools,
    ai_other: aiOther,
    utm_source: clean(input.utmSource, 200),
    utm_medium: clean(input.utmMedium, 200),
    utm_campaign: clean(input.utmCampaign, 200),
    referrer: clean(input.referrer, 500),
    consent_at: new Date().toISOString(),
  };

  // 개발 전용: 저장 없이 성공 (production에서는 무시)
  if (process.env.WAITLIST_DRY_RUN === "1" && process.env.NODE_ENV !== "production") {
    return { ok: true };
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("SUPABASE env missing");
    return fail("server");
  }

  try {
    const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/waitlist`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) return { ok: true };

    let code: string | undefined;
    try {
      code = ((await res.json()) as { code?: string }).code;
    } catch {
      code = undefined;
    }
    if (res.status === 409 || code === "23505") return fail("duplicate");

    // 이메일 등 개인정보는 로그에 남기지 않는다
    console.error("waitlist insert failed", res.status, code ?? "");
    return fail("server");
  } catch (err) {
    console.error("waitlist insert error", err instanceof Error ? err.name : "unknown");
    return fail("server");
  }
}
