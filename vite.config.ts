// Vercel-compatible build: SPA mode (no SSR/Workers).
// The Cloudflare plugin is disabled and prerendering produces static HTML
// that deploys anywhere, including Vercel as a static site.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
    },
  },
});
