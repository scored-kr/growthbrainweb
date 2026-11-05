import type { ReactNode } from "react";

type Props = { size?: number; strokeWidth?: number; stroke?: string; className?: string };

function Svg({ size = 36, strokeWidth = 1.6, stroke = "currentColor", className, children }: Props & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p: Props) => (
  <Svg size={20} strokeWidth={2} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const Bookmark = (p: Props) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </Svg>
);

export const ChatDots = (p: Props) => (
  <Svg {...p}>
    <path d="M4 5h16v11H9l-5 4z" />
    <path d="M9 10.5h.01M12 10.5h.01M15 10.5h.01" />
  </Svg>
);

export const Layers = (p: Props) => (
  <Svg {...p}>
    <path d="M12 3l9 5-9 5-9-5z" />
    <path d="M3 13l9 5 9-5" />
  </Svg>
);

export const Calendar = (p: Props) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);

export const ListIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M9 6h12M9 12h12M9 18h12" />
    <circle cx="4" cy="6" r="1" />
    <circle cx="4" cy="12" r="1" />
    <circle cx="4" cy="18" r="1" />
  </Svg>
);

export const OpenBox = (p: Props) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M9 15l6-6M10 9h5v5" />
  </Svg>
);

export const TwoChats = (p: Props) => (
  <Svg {...p}>
    <path d="M3 4h12v8H7l-4 3z" />
    <path d="M9 15v2h8l4 3V9h-3" />
  </Svg>
);

export const CalendarDots = (p: Props) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
  </Svg>
);

export const Docs = (p: Props) => (
  <Svg {...p}>
    <rect x="8" y="3" width="13" height="15" rx="2" />
    <path d="M5 7v12a2 2 0 0 0 2 2h10M11 8h7M11 12h7" />
  </Svg>
);
