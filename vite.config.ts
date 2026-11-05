import react from "@vitejs/plugin-react";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";

/**
 * Fills %SITE_URL% in index.html (canonical, Open Graph, JSON-LD).
 * Social crawlers need absolute URLs; set VITE_SITE_URL in Vercel / .env.local.
 */
function siteUrl(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const url = (env.VITE_SITE_URL || "https://hanz.mn").replace(/\/+$/, "");
  return {
    name: "site-url",
    transformIndexHtml: (html) => html.replaceAll("%SITE_URL%", url),
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), siteUrl(mode)],
  // The website needs absolute asset paths, or a deep link such as /courses/hsk4 asks
  // for /courses/assets/… and gets the index page back (a blank screen). The native
  // apps keep a relative base: `npm run cap:sync` builds with --mode capacitor.
  base: mode === "capacitor" ? "./" : "/",
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
  },
}));
