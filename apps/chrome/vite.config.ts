import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import path from "path";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@visual-json/core": path.resolve(
        __dirname,
        "../../packages/@visual-json/core/src/index.ts",
      ),
      "@visual-json/react": path.resolve(
        __dirname,
        "../../packages/@visual-json/react/src/index.ts",
      ),
    },
  },
  build: {
    rollupOptions: {
      input: {
        devtools_panel: "src/devtools/panel.html",
        options: "src/options/index.html",
        tab: "src/tab/index.html",
      },
    },
  },
});
