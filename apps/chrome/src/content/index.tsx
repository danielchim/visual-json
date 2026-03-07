import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type CSSProperties,
} from "react";
import { createRoot } from "react-dom/client";
import type { JsonValue } from "@visual-json/core";
import { JsonEditor } from "@visual-json/react";
import { useTheme } from "../shared/use-theme";
import { useEditorSettings } from "../shared/use-editor-settings";
import { setViewMode as persistViewMode } from "../shared/storage";
import { SettingsPanel } from "../shared/SettingsPanel";
import "./styles.css";

function detectJsonPage(): JsonValue | null {
  const pre = document.querySelector("body > pre");
  if (!pre) return null;

  const children = document.body.children;
  const isJsonPage =
    (children.length === 1 && children[0].tagName === "PRE") ||
    (children.length === 2 &&
      children[0].tagName === "PRE" &&
      children[1].classList.contains("json-formatter-container"));

  if (!isJsonPage) return null;

  try {
    return JSON.parse(pre.textContent ?? "") as JsonValue;
  } catch {
    return null;
  }
}

function ContentApp({ initialValue }: { initialValue: JsonValue }) {
  const theme = useTheme();
  const { settings, viewMode, sidebarOpen, toggleSidebar } =
    useEditorSettings();
  const [jsonValue, setJsonValue] = useState<JsonValue>(initialValue);
  const [rawText, setRawText] = useState(JSON.stringify(initialValue, null, 2));
  const [rawError, setRawError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleChange = useCallback((value: JsonValue) => {
    setJsonValue(value);
    setRawText(JSON.stringify(value, null, 2));
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(JSON.stringify(jsonValue, null, 2));
  }, [jsonValue]);

  const handleCopyMinified = useCallback(async () => {
    await navigator.clipboard.writeText(JSON.stringify(jsonValue));
  }, [jsonValue]);

  const handleRawChange = useCallback((newText: string) => {
    setRawText(newText);
    try {
      const parsed = JSON.parse(newText);
      setRawError(null);
      setJsonValue(parsed);
    } catch (e) {
      setRawError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, []);

  const toggleViewMode = useCallback(() => {
    const next = viewMode === "tree" ? "raw" : "tree";
    persistViewMode(next);
  }, [viewMode]);

  const containerStyle: CSSProperties = {
    ...theme,
    background: "var(--vj-bg, #ffffff)",
    color: "var(--vj-text, #1e1e1e)",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  };

  if (showSettings) {
    return (
      <div style={containerStyle}>
        <SettingsPanel onBack={() => setShowSettings(false)} />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="content-toolbar">
        <span className="content-title">visual-json</span>
        <button onClick={handleCopy}>Copy</button>
        <button onClick={handleCopyMinified}>Copy minified</button>
        <button onClick={toggleViewMode} style={{ fontWeight: 600 }}>
          {viewMode === "tree" ? "Raw" : "Tree"}
        </button>
        <button onClick={() => setShowSettings(true)} title="Settings">
          ⚙
        </button>
        <button
          onClick={toggleSidebar}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          className="toolbar-sidebar-toggle"
        >
          {sidebarOpen ? "◧" : "▣"}
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {viewMode === "raw" ? (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {rawError && (
              <div
                style={{
                  padding: "4px 10px",
                  fontSize: 11,
                  background: "#ff000018",
                  color: "#cc3333",
                  borderBottom: "1px solid var(--vj-border, #e0e0e0)",
                }}
              >
                {rawError}
              </div>
            )}
            <textarea
              value={rawText}
              onChange={(e) => handleRawChange(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                width: "100%",
                background: "transparent",
                color: "var(--vj-text)",
                fontFamily: "monospace",
                fontSize: 13,
                padding: 16,
                border: "none",
                outline: "none",
                resize: "none",
                lineHeight: 1.6,
              }}
            />
          </div>
        ) : (
          <JsonEditor
            value={jsonValue}
            onChange={handleChange}
            style={theme}
            height="100%"
            sidebarOpen={sidebarOpen}
            treeShowValues={settings.treeShowValues}
            treeShowCounts={settings.treeShowCounts}
            editorShowDescriptions={settings.editorShowDescriptions}
            editorShowCounts={settings.editorShowCounts}
          />
        )}
      </div>
    </div>
  );
}

function mount() {
  const json = detectJsonPage();
  if (json === null) return;

  document.body.innerHTML = "";
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";

  const root = document.createElement("div");
  root.id = "visual-json-root";
  root.style.height = "100vh";
  root.style.width = "100vw";
  document.body.appendChild(root);

  createRoot(root).render(<ContentApp initialValue={json} />);
}

mount();
