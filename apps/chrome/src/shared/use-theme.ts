import { useState, useEffect, useRef, type CSSProperties } from "react";
import { LIGHT_THEME, DARK_THEME } from "./theme";
import { getThemePreference, type ThemePreference } from "./storage";

function resolveTheme(pref: ThemePreference): CSSProperties {
  if (pref === "light") return LIGHT_THEME;
  if (pref === "dark") return DARK_THEME;
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return DARK_THEME;
  }
  return LIGHT_THEME;
}

export function useTheme(): CSSProperties {
  const prefRef = useRef<ThemePreference>("system");
  const [theme, setTheme] = useState<CSSProperties>(() =>
    resolveTheme("system"),
  );

  useEffect(() => {
    getThemePreference().then((stored) => {
      prefRef.current = stored;
      setTheme(resolveTheme(stored));
    });
  }, []);

  useEffect(() => {
    const handler = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.theme) {
        const next = changes.theme.newValue as ThemePreference;
        prefRef.current = next;
        setTheme(resolveTheme(next));
      }
    };
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, []);

  useEffect(() => {
    if (prefRef.current !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme(resolveTheme("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  });

  return theme;
}
