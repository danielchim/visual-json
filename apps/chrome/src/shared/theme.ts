import type { CSSProperties } from "react";

export const LIGHT_THEME: CSSProperties = {
  "--vj-bg": "#ffffff",
  "--vj-bg-panel": "#f7f7f7",
  "--vj-bg-hover": "#eeeeee",
  "--vj-bg-selected": "#d0e8ff",
  "--vj-bg-selected-muted": "#e4e4e4",
  "--vj-bg-match": "#fff3cd",
  "--vj-bg-match-active": "#ffe69c",
  "--vj-border": "#e0e0e0",
  "--vj-border-subtle": "#eeeeee",
  "--vj-text": "#1e1e1e",
  "--vj-text-muted": "#666666",
  "--vj-text-dim": "#999999",
  "--vj-text-dimmer": "#bbbbbb",
  "--vj-text-selected": "#1e1e1e",
  "--vj-string": "#a31515",
  "--vj-number": "#098658",
  "--vj-boolean": "#0000ff",
  "--vj-accent": "#0066cc",
  "--vj-accent-muted": "#d0e8ff",
  "--vj-input-bg": "#ffffff",
  "--vj-input-border": "#cccccc",
  "--vj-error": "#d32f2f",
  "--vj-font": "monospace",
  "--vj-input-font-size": "13px",
} as CSSProperties;

export const DARK_THEME: CSSProperties = {
  "--vj-bg": "#0a0a0a",
  "--vj-bg-panel": "#171717",
  "--vj-bg-hover": "#262626",
  "--vj-bg-selected": "#e5e5e5",
  "--vj-bg-selected-muted": "#262626",
  "--vj-bg-match": "#3a3520",
  "--vj-bg-match-active": "#51502b",
  "--vj-border": "#303030",
  "--vj-border-subtle": "#262626",
  "--vj-text": "#f9f9f9",
  "--vj-text-muted": "#a0a0a0",
  "--vj-text-dim": "#a0a0a0",
  "--vj-text-dimmer": "#737373",
  "--vj-text-selected": "#171717",
  "--vj-string": "#ce9178",
  "--vj-number": "#b5cea8",
  "--vj-boolean": "#569cd6",
  "--vj-accent": "#e5e5e5",
  "--vj-accent-muted": "#262626",
  "--vj-input-bg": "#3c3c3c",
  "--vj-input-border": "#303030",
  "--vj-error": "#f48771",
  "--vj-font": "monospace",
  "--vj-input-font-size": "13px",
} as CSSProperties;

export function getSystemTheme(): CSSProperties {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return DARK_THEME;
  }
  return LIGHT_THEME;
}
