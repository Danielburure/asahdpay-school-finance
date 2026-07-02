// Vercel-compatible build: SPA mode.
// Vercel serves dist/client with a catch-all rewrite to /_shell.html (see vercel.json).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    spa: {
      enabled: true,
    },
  },
});
