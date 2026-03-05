import { useState, useEffect, useCallback } from "react";
import {
  getThemePreference,
  setThemePreference,
  getOpenMode,
  setOpenMode,
  getEditorSettings,
  setEditorSettings,
  type ThemePreference,
  type OpenMode,
  type EditorSettings,
} from "./storage";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const MODE_OPTIONS: { value: OpenMode; label: string }[] = [
  { value: "popup", label: "Popup" },
  { value: "tab", label: "New tab" },
];

export function SettingsPanel({ onBack }: { onBack: () => void }) {
  const [themePref, setThemePref] = useState<ThemePreference>("system");
  const [openMode, setOpenModeState] = useState<OpenMode>("popup");
  const [edSettings, setEdSettings] = useState<EditorSettings>({
    treeShowValues: true,
    treeShowCounts: false,
    editorShowDescriptions: false,
    editorShowCounts: false,
  });

  useEffect(() => {
    getThemePreference().then(setThemePref);
    getOpenMode().then(setOpenModeState);
    getEditorSettings().then(setEdSettings);
  }, []);

  const handleThemeChange = useCallback((value: ThemePreference) => {
    setThemePref(value);
    setThemePreference(value);
  }, []);

  const handleModeChange = useCallback((value: OpenMode) => {
    setOpenModeState(value);
    setOpenMode(value);
  }, []);

  const handleToggle = useCallback(
    (key: keyof EditorSettings) => {
      const next = { ...edSettings, [key]: !edSettings[key] };
      setEdSettings(next);
      setEditorSettings(next);
    },
    [edSettings],
  );

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <button onClick={onBack} style={backBtnStyle}>
            ← Back
          </button>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--vj-text)" }}>
            Settings
          </span>
        </div>

        <Section title="Theme">
          <RadioGroup
            options={THEME_OPTIONS}
            value={themePref}
            onChange={handleThemeChange}
          />
        </Section>

        <Section title="Toolbar icon behavior">
          <RadioGroup
            options={MODE_OPTIONS}
            value={openMode}
            onChange={handleModeChange}
          />
        </Section>

        <Section title="Tree">
          <ToggleRow
            label="Values"
            checked={edSettings.treeShowValues}
            onChange={() => handleToggle("treeShowValues")}
          />
          <ToggleRow
            label="Property counts"
            checked={edSettings.treeShowCounts}
            onChange={() => handleToggle("treeShowCounts")}
          />
        </Section>

        <Section title="Editor">
          <ToggleRow
            label="Descriptions"
            checked={edSettings.editorShowDescriptions}
            onChange={() => handleToggle("editorShowDescriptions")}
          />
          <ToggleRow
            label="Property counts"
            checked={edSettings.editorShowCounts}
            onChange={() => handleToggle("editorShowCounts")}
          />
        </Section>
      </div>
    </div>
  );
}

const backBtnStyle: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 4,
  border: "1px solid var(--vj-border, #e0e0e0)",
  background: "var(--vj-bg-panel, #f7f7f7)",
  color: "var(--vj-text, #1e1e1e)",
  fontFamily: "inherit",
  fontSize: 12,
  cursor: "pointer",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--vj-text-muted)",
        marginBottom: 6,
      }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {children}
      </div>
    </div>
  );
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      {options.map((opt) => (
        <label
          key={opt.value}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 8px",
            borderRadius: 4,
            cursor: "pointer",
            background: value === opt.value ? "var(--vj-bg-hover)" : "transparent",
          }}
        >
          <input
            type="radio"
            name={`radio-${options[0].value}`}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            style={{
              width: 16,
              height: 16,
              cursor: "pointer",
              accentColor: "var(--vj-accent, #0066cc)",
            }}
          />
          <span style={{
            fontSize: 13,
            color: "var(--vj-text)",
          }}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "5px 8px",
      borderRadius: 4,
      cursor: "pointer",
    }}>
      <span style={{ fontSize: 13 }}>{label}</span>
      <div
        onClick={(e) => { e.preventDefault(); onChange(); }}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: checked ? "var(--vj-accent, #0066cc)" : "var(--vj-border, #cccccc)",
          position: "relative",
          transition: "background 0.15s",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          background: "#ffffff",
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          transition: "left 0.15s",
        }} />
      </div>
    </label>
  );
}
