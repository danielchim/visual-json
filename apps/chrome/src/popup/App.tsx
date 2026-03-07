import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";
import type { JsonValue } from "@visual-json/core";
import { JsonEditor } from "@visual-json/react";
import {
  getStoredJson,
  setStoredJson,
  setViewMode as persistViewMode,
} from "../shared/storage";
import { useTheme } from "../shared/use-theme";
import { useEditorSettings } from "../shared/use-editor-settings";
import { SettingsPanel } from "../shared/SettingsPanel";

export function App() {
  const theme = useTheme();
  const { settings, viewMode, sidebarOpen, toggleSidebar } =
    useEditorSettings();
  const [jsonValue, setJsonValue] = useState<JsonValue | null>(null);
  const [rawInput, setRawInput] = useState("");
  const [rawText, setRawText] = useState("");
  const [rawError, setRawError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    getStoredJson().then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setJsonValue(parsed);
          setRawText(JSON.stringify(parsed, null, 2));
        } catch {
          // ignore
        }
      }
    });
  }, []);

  const handleParse = useCallback(() => {
    try {
      const parsed = JSON.parse(rawInput);
      setJsonValue(parsed);
      setRawText(JSON.stringify(parsed, null, 2));
      setParseError(null);
      setStoredJson(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }, [rawInput]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawInput(text);
      try {
        const parsed = JSON.parse(text);
        setJsonValue(parsed);
        setRawText(JSON.stringify(parsed, null, 2));
        setParseError(null);
        setStoredJson(JSON.stringify(parsed, null, 2));
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Invalid JSON");
      }
    } catch {
      setParseError("Failed to read clipboard");
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (jsonValue !== null) {
      await navigator.clipboard.writeText(JSON.stringify(jsonValue, null, 2));
    }
  }, [jsonValue]);

  const handleCopyMinified = useCallback(async () => {
    if (jsonValue !== null) {
      await navigator.clipboard.writeText(JSON.stringify(jsonValue));
    }
  }, [jsonValue]);

  const handleChange = useCallback((value: JsonValue) => {
    setJsonValue(value);
    setRawText(JSON.stringify(value, null, 2));
    setStoredJson(JSON.stringify(value, null, 2));
  }, []);

  const handleClear = useCallback(() => {
    setJsonValue(null);
    setRawInput("");
    setRawText("");
    setRawError(null);
    setParseError(null);
    setStoredJson("");
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          setJsonValue(parsed);
          setRawText(JSON.stringify(parsed, null, 2));
          setParseError(null);
          setStoredJson(JSON.stringify(parsed, null, 2));
        } catch (err) {
          setParseError(err instanceof Error ? err.message : "Invalid JSON");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [],
  );

  const handleOpenTab = useCallback(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("src/tab/index.html") });
    window.close();
  }, []);

  const handleRawChange = useCallback((newText: string) => {
    setRawText(newText);
    try {
      const parsed = JSON.parse(newText);
      setRawError(null);
      setJsonValue(parsed);
      setStoredJson(JSON.stringify(parsed, null, 2));
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
    height: "100%",
  };

  if (showSettings) {
    return (
      <div className="popup-container" style={containerStyle}>
        <SettingsPanel onBack={() => setShowSettings(false)} />
      </div>
    );
  }

  const fileInput = (
    <input
      type="file"
      accept=".json,.jsonc"
      onChange={handleFileChange}
      style={{ display: "none" }}
    />
  );

  const handleLoadFileClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const parent = e.currentTarget.parentElement;
      if (!parent) return;
      const input = parent.querySelector(
        "input[type=file]",
      ) as HTMLInputElement;
      if (input) input.click();
    },
    [],
  );

  if (jsonValue === null) {
    return (
      <div className="popup-container" style={containerStyle}>
        <div className="popup-toolbar">
          <span className="title">visual-json</span>
          <button onClick={handlePaste}>Paste from clipboard</button>
          <button onClick={handleLoadFileClick}>Load file</button>
          {fileInput}
          <button onClick={handleOpenTab} title="Open in new tab">
            ↗
          </button>
          <button onClick={() => setShowSettings(true)} title="Settings">
            ⚙
          </button>
        </div>
        <div className="popup-empty">
          <span>Paste or type JSON below</span>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder='{"key": "value"}'
            spellCheck={false}
          />
          {parseError && <span className="popup-error">{parseError}</span>}
          <button onClick={handleParse} className="popup-load-btn">
            Load JSON
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container" style={containerStyle}>
      <div className="popup-toolbar">
        <span className="title">visual-json</span>
        <button onClick={handleCopy}>Copy</button>
        <button onClick={handleCopyMinified}>Copy min</button>
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleLoadFileClick}>Load file</button>
        {fileInput}
        <button
          onClick={toggleViewMode}
          title={
            viewMode === "tree" ? "Switch to raw view" : "Switch to tree view"
          }
          style={{ fontWeight: 600 }}
        >
          {viewMode === "tree" ? "Raw" : "Tree"}
        </button>
        <button onClick={handleOpenTab} title="Open in new tab">
          ↗
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
      <div className="popup-editor">
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
                fontSize: 12,
                padding: 10,
                border: "none",
                outline: "none",
                resize: "none",
                lineHeight: 1.5,
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
