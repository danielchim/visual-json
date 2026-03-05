import { type CSSProperties } from "react";
import { useTheme } from "../shared/use-theme";
import { SettingsPanel } from "../shared/SettingsPanel";

export function Options() {
  const theme = useTheme();

  const pageStyle: CSSProperties = {
    ...theme,
    background: "var(--vj-bg)",
    color: "var(--vj-text)",
    minHeight: "100vh",
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 0" }}>
        <SettingsPanel onBack={() => window.close()} />
      </div>
    </div>
  );
}
