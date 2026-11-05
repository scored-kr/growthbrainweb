import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Growth Brain — 오늘도 AI에게 똑같은 내용을 설명하고 계신가요?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontPath = (file: string) => path.join(process.cwd(), "fonts", file);

export default async function OpengraphImage() {
  const [bold, regular] = await Promise.all([
    readFile(fontPath("NEXONLv1Gothic-Bold.woff")),
    readFile(fontPath("NEXONLv1Gothic-Regular.woff")),
  ]);

  const card = (opts: { name: string; when: string; chip: "gpt" | "claude"; text: string; loaded?: boolean; right?: boolean }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignSelf: opts.right ? "flex-end" : "flex-start",
        width: 400,
        background: "#FFFFFF",
        border: "1px solid #DCE3EE",
        borderRadius: 16,
        boxShadow: "0 10px 28px rgba(15, 40, 80, 0.09)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid #EEF1F5" }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: opts.chip === "gpt" ? 6 : 11,
            background: opts.chip === "gpt" ? "#111827" : "#D97757",
          }}
        />
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{opts.name}</div>
        <div style={{ fontSize: 15, color: "#6B7280" }}>{`· ${opts.when}`}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, padding: 18 }}>
        {opts.loaded ? (
          <div
            style={{
              display: "flex",
              background: "#E6F0FF",
              color: "#0052CC",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            이전 작업 불러옴
          </div>
        ) : null}
        <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 12, padding: "12px 16px", fontSize: 18, color: "#111827", lineHeight: 1.5 }}>
          {opts.text}
        </div>
      </div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 48,
          padding: "0 64px",
          background: "#FFFFFF",
          fontFamily: "Nexon",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28, flex: 1 }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#0062F5" }}>Growth Brain</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 54, fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.035em", color: "#111827" }}>
            <div>오늘도 AI에게</div>
            <div>똑같은 내용을</div>
            <div>설명하고 계신가요?</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            width: 520,
            padding: "40px 32px",
            background: "#EEF5FF",
            borderRadius: 32,
          }}
        >
          {card({ name: "ChatGPT", when: "어제", chip: "gpt", text: "제안서 기획하자, 결론부터 예산 이야기는 2장으로 빼자." })}
          {card({ name: "Claude", when: "오늘", chip: "claude", text: "결론 먼저, 예산은 2장으로 뺀 구조로 초안 잡아볼게요.", loaded: true, right: true })}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Nexon", data: regular, weight: 400, style: "normal" },
        { name: "Nexon", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
