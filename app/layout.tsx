import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const nexon = localFont({
  src: [
    { path: "../fonts/NEXONLv1Gothic-Light.woff", weight: "300", style: "normal" },
    { path: "../fonts/NEXONLv1Gothic-Regular.woff", weight: "400", style: "normal" },
    { path: "../fonts/NEXONLv1Gothic-Bold.woff", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-nexon",
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
  // 폴백 폰트 메트릭을 넥슨 Lv.1 고딕에 맞춰 조정 → 폰트 교체 시 레이아웃 시프트 최소화
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={nexon.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
