export type ThemePreference = "light" | "dark" | "system";
export type OpenMode = "popup" | "tab";
export type ViewMode = "tree" | "raw";

export interface EditorSettings {
  treeShowValues: boolean;
  treeShowCounts: boolean;
  editorShowDescriptions: boolean;
  editorShowCounts: boolean;
}

const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  treeShowValues: true,
  treeShowCounts: false,
  editorShowDescriptions: false,
  editorShowCounts: false,
};

export async function getStoredJson(): Promise<string | null> {
  const result = await chrome.storage.local.get("lastJson");
  return result.lastJson ?? null;
}

export async function setStoredJson(json: string): Promise<void> {
  await chrome.storage.local.set({ lastJson: json });
}

export async function getThemePreference(): Promise<ThemePreference> {
  const result = await chrome.storage.local.get("theme");
  return result.theme ?? "system";
}

export async function setThemePreference(theme: ThemePreference): Promise<void> {
  await chrome.storage.local.set({ theme });
}

export async function getOpenMode(): Promise<OpenMode> {
  const result = await chrome.storage.local.get("openMode");
  return result.openMode ?? "popup";
}

export async function setOpenMode(mode: OpenMode): Promise<void> {
  await chrome.storage.local.set({ openMode: mode });
}

export async function getViewMode(): Promise<ViewMode> {
  const result = await chrome.storage.local.get("viewMode");
  return result.viewMode ?? "tree";
}

export async function setViewMode(mode: ViewMode): Promise<void> {
  await chrome.storage.local.set({ viewMode: mode });
}

export async function getEditorSettings(): Promise<EditorSettings> {
  const result = await chrome.storage.local.get("editorSettings");
  return { ...DEFAULT_EDITOR_SETTINGS, ...result.editorSettings };
}

export async function setEditorSettings(settings: EditorSettings): Promise<void> {
  await chrome.storage.local.set({ editorSettings: settings });
}

export async function getSidebarOpen(): Promise<boolean> {
  const result = await chrome.storage.local.get("sidebarOpen");
  return result.sidebarOpen ?? true;
}

export async function setSidebarOpen(open: boolean): Promise<void> {
  await chrome.storage.local.set({ sidebarOpen: open });
}
