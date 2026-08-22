// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  nitro: {
    preset: "static",
  },
  vite: {
    build: {
      reportCompressedSize: false,
      sourcemap: false,
      minify: false,
      chunkSizeWarningLimit: 2000,
    },
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        filename: "sw.js",
        devOptions: { enabled: false },
        manifest: false,
        workbox: {
          navigateFallback: "/",
          // App-shell routes launched from home-screen shortcuts must always
          // resolve their own document (network first) instead of being
          // rewritten to the marketing shell by the shared root-scoped worker.
          navigateFallbackDenylist: [
            /^\/~oauth/,
            /^\/api\//,
            /^\/connect-app(\/|$)/,
            /^\/vione-app(\/|$)/,
            /^\/auth(\/|$)/,
          ],

          // Manifests are intentionally NOT precached: they must always be
          // revalidated so a re-scan installs the latest start_url/icons.
          globPatterns: ["**/*.{js,css,html,woff,woff2,png,svg,ico}"],
          runtimeCaching: [
            {
              // Web app manifests — always try the network first so a bumped
              // ?v= (or an edited manifest) is picked up on the next install.
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin && /\.webmanifest$/.test(url.pathname),
              handler: "NetworkFirst",
              options: {
                cacheName: "vba-manifest",
                networkTimeoutSeconds: 3,
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 6, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "vba-html",
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
              },
            },
            {
              // Versioned/hashed build assets — safe to serve cache-first.
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin && /\.(?:js|css|woff2?|png|svg|ico)$/.test(url.pathname),
              handler: "CacheFirst",
              options: {
                cacheName: "vba-assets",
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              // Read-only data: Supabase REST GETs. Show cached data instantly,
              // refresh in the background. Only GET requests are cached.
              urlPattern: ({ url, request }) =>
                request.method === "GET" && /\/rest\/v1\//.test(url.pathname),
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "vba-api-rest",
                cacheableResponse: { statuses: [200] },
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
            {
              // Server-function GET reads (TanStack createServerFn GET).
              urlPattern: ({ url, request }) =>
                request.method === "GET" && /\/_serverFn\//.test(url.pathname),
              handler: "NetworkFirst",
              options: {
                cacheName: "vba-api-serverfn",
                networkTimeoutSeconds: 3,
                cacheableResponse: { statuses: [200] },
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 6 },
              },
            },
            {
              // Supabase Storage public assets (images, files).
              urlPattern: ({ url, request }) =>
                request.method === "GET" && /\/storage\/v1\/object\/public\//.test(url.pathname),
              handler: "CacheFirst",
              options: {
                cacheName: "vba-storage",
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
  },
});
