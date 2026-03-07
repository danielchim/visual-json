import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
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
