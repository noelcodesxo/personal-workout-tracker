// Design tokens — implemented in Epic 1
// These are the single source of truth for the Astron design system.
// Values here extend the Tailwind theme in tailwind.config.ts.

export const colors = {
  ink: "#111111",
  surface: "#ffffff",
  accent: "#0D1B2A",
  "accent-dim": "rgba(13,27,42,0.05)",
  "accent-soft": "rgba(13,27,42,0.10)",
  "accent-glow": "rgba(0,50,140,0.22)",
  "gray-100": "#f4f4f4",
  "gray-200": "#e8e8e8",
  "gray-400": "#aaaaaa",
  "gray-600": "#666666",
  "gray-800": "#2a2a2a",
  border: "#e0e0e0",
  "border-dark": "#111111",
  danger: "#c0392b",
} as const;

export const radius = "2px";
export const screenGutter = "24px";
