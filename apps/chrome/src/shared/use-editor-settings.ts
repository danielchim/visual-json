import { useState, useEffect, useCallback } from "react";
import {
  getEditorSettings,
  getViewMode,
  getSidebarOpen,
  setSidebarOpen as persistSidebarOpen,
  DEFAULT_EDITOR_SETTINGS,
  type EditorSettings,
  type ViewMode,
} from "./storage";

export function useEditorSettings() {
  const [settings, setSettings] = useState<EditorSettings>(
    DEFAULT_EDITOR_SETTINGS,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    getEditorSettings().then(setSettings);
    getViewMode().then(setViewMode);
    getSidebarOpen().then(setSidebarOpen);

    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.editorSettings) {
        setSettings(changes.editorSettings.newValue);
      }
      if (changes.viewMode) {
        setViewMode(changes.viewMode.newValue);
      }
      if (changes.sidebarOpen != null) {
        setSidebarOpen(changes.sidebarOpen.newValue);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const toggleSidebar = useCallback(() => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    persistSidebarOpen(next);
  }, [sidebarOpen]);

  return { settings, viewMode, sidebarOpen, toggleSidebar };
}
