import { ImageResponse } from "next/og";

// 임시 텍스트 아이콘 — 로고 이미지가 나오면 교체
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0062F5",
          color: "#FFFFFF",
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        GB
      </div>
    ),
    size,
  );
}
