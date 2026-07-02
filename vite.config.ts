// Vercel-compatible build: SPA mode (no SSR/Workers).
// Prerender produces static HTML deployable as a static site.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    spa: {
      enabled: true,
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
    },
  },
});
