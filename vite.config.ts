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
  // Relative base so Capacitor can load assets from the native webview
  base: "./",
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
  },
}));
