// Vercel-compatible build: SPA mode without prerender.
// The Nitro Worker output is unused on Vercel; Vercel serves dist/client
// with a catch-all rewrite to /_shell.html (see vercel.json).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
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
