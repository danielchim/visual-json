import { useState, useEffect, useCallback, type CSSProperties } from "react";
import type { JsonValue } from "@visual-json/core";
import { JsonEditor } from "@visual-json/react";
import { useTheme } from "../shared/use-theme";
import { useEditorSettings } from "../shared/use-editor-settings";

interface CapturedRequest {
  id: number;
  url: string;
  method: string;
  status: number;
  entry: chrome.devtools.network.Request;
}

let nextId = 0;

function getUrlLabel(url: string) {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

export function Panel() {
  const theme = useTheme();
  const { settings, sidebarOpen, toggleSidebar } = useEditorSettings();
  const [requests, setRequests] = useState<CapturedRequest[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [jsonValue, setJsonValue] = useState<JsonValue | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onRequestFinished(request: chrome.devtools.network.Request) {
      const contentType =
        request.response?.content?.mimeType?.toLowerCase() ?? "";
      if (!contentType.includes("json")) return;

      const captured: CapturedRequest = {
        id: nextId++,
        url: request.request.url,
        method: request.request.method,
        status: request.response.status,
        entry: request,
      };

      setRequests((prev) => [...prev, captured]);
    }

    chrome.devtools.network.onRequestFinished.addListener(
      onRequestFinished as (request: chrome.devtools.network.Request) => void,
    );

    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(
        onRequestFinished as (request: chrome.devtools.network.Request) => void,
      );
    };
  }, []);

  const handleSelect = useCallback((req: CapturedRequest) => {
    setSelectedId(req.id);
    setLoading(true);
    setJsonValue(null);

    req.entry.getContent((content: string) => {
      try {
        const parsed = JSON.parse(content) as JsonValue;
        setJsonValue(parsed);
      } catch {
        setJsonValue(content as unknown as JsonValue);
      }
      setLoading(false);
    });
  }, []);

  const containerStyle: CSSProperties = {
    ...theme,
    background: "var(--vj-bg, #1e1e1e)",
    color: "var(--vj-text, #cccccc)",
    height: "100%",
  };

  return (
    <div className="devtools-container" style={containerStyle}>
      {sidebarOpen && (
        <div className="devtools-sidebar">
          <div className="devtools-sidebar-header">
            <button
              onClick={toggleSidebar}
              className="devtools-toggle-btn"
              title="Hide sidebar"
            >
              ◧
            </button>
            <span>JSON Requests ({requests.length})</span>
          </div>
          <ul className="devtools-request-list">
            {requests.map((req) => (
              <li
                key={req.id}
                className={`devtools-request-item ${selectedId === req.id ? "selected" : ""}`}
                onClick={() => handleSelect(req)}
                title={req.url}
              >
                <span className="devtools-request-method">{req.method}</span>
                {getUrlLabel(req.url)}
                <span className="devtools-request-status">{req.status}</span>
              </li>
            ))}
          </ul>
          {requests.length === 0 && (
            <div
              style={{
                padding: "16px 10px",
                color: "var(--vj-text-dim, #666666)",
                fontSize: 12,
              }}
            >
              No JSON requests captured yet. Reload the page or make API calls.
            </div>
          )}
        </div>
      )}
      <div className="devtools-main">
        {!sidebarOpen && (
          <div className="devtools-collapsed-bar">
            <button
              onClick={toggleSidebar}
              className="devtools-toggle-btn"
              title="Show sidebar"
            >
              ▣
            </button>
          </div>
        )}
        {selectedId === null && (
          <div className="devtools-empty">
            Select a request to view its JSON response
          </div>
        )}
        {selectedId !== null && loading && (
          <div className="devtools-loading">Loading response...</div>
        )}
        {selectedId !== null && !loading && jsonValue !== null && (
          <JsonEditor
            value={jsonValue}
            readOnly
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
