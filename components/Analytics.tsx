"use client";

import Script from "next/script";
import { useEffect } from "react";
import { META_PIXEL_ID, POSTHOG_HOST, POSTHOG_KEY, posthogEnabled, setAnalyticsClient, track } from "@/lib/analytics";

/**
 * PostHog·Meta Pixel 로더. 키가 비어 있으면 스크립트를 전혀 로드하지 않는다.
 * - 섹션 노출: [data-section] 요소가 50% 이상 보이면 1회 section_view
 * - CTA 클릭: [data-cta] 요소 클릭 시 cta_click
 */
export default function Analytics() {
  useEffect(() => {
    if (!posthogEnabled) return;
    let cancelled = false;
    import("posthog-js").then(({ default: posthog }) => {
      if (cancelled) return;
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: true,
        person_profiles: "identified_only",
        // 세션 녹화: 모든 입력값 마스킹(이메일 포함)
        session_recording: { maskAllInputs: true },
      });
      setAnalyticsClient(posthog);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!posthogEnabled) return;

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-cta]");
      const location = el?.getAttribute("data-cta");
      if (location) track("cta_click", { location });
    };
    document.addEventListener("click", onClick);

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            // 화면보다 긴 섹션은 비율이 50%에 못 미치므로, 화면의 절반 이상을 채우면 노출로 본다
            const enough =
              entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= window.innerHeight * 0.5;
            if (!enough) continue;
            const section = entry.target.getAttribute("data-section");
            if (section) track("section_view", { section });
            observer?.unobserve(entry.target);
          }
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] },
      );
      document.querySelectorAll("[data-section]").forEach((el) => observer?.observe(el));
    }

    return () => {
      document.removeEventListener("click", onClick);
      observer?.disconnect();
    };
  }, []);

  if (!META_PIXEL_ID) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(META_PIXEL_ID)});fbq('track','PageView');`}
    </Script>
  );
}
