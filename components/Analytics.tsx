"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { META_PIXEL_ID, POSTHOG_HOST, POSTHOG_KEY, posthogEnabled, setAnalyticsClient, track } from "@/lib/analytics";

let posthogInitialization: Promise<void> | null = null;

function initializePosthog() {
  // Strict Mode의 effect 재실행 및 재마운트에도 PageView/초기화는 한 번만.
  if (!posthogInitialization) {
    posthogInitialization = import("posthog-js")
      .then(({ default: posthog }) => {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          capture_pageview: true,
          autocapture: false,
          person_profiles: "identified_only",
          disable_session_recording: false,
          session_recording: { maskAllInputs: true },
        });
        setAnalyticsClient(posthog);
      })
      .catch(() => {
        // 광고 차단/네트워크 실패가 페이지의 unhandled rejection이 되지 않게 한다.
        posthogInitialization = null;
      });
  }
  return posthogInitialization;
}

/**
 * PostHog·Meta Pixel 로더. 키가 비어 있으면 스크립트를 전혀 로드하지 않는다.
 * - 섹션 노출: [data-section] 요소가 50% 이상 보이면 1회 section_view
 * - CTA 클릭: [data-cta] 요소 클릭 시 cta_click
 */
export default function Analytics() {
  const seenSections = useRef(new Set<string>());

  useEffect(() => {
    if (!posthogEnabled) return;
    void initializePosthog();
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
            if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
            const section = entry.target.getAttribute("data-section");
            if (section && !seenSections.current.has(section)) {
              seenSections.current.add(section);
              track("section_view", { section });
            }
            observer?.unobserve(entry.target);
          }
        },
        { threshold: 0.5 },
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
