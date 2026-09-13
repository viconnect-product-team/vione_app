import { defineConfig } from "nitro/config";

// Bundle all dependencies into the server output instead of relying on
// @vercel/nft (nf3) dependency tracing, which fails with CommonJS
// compatibility errors on certain packages during the self-hosted Docker
// (node-server preset) build. Auto-loaded and merged by Nitro.
const backendTarget = process.env.NEST_API_URL || 'http://localhost:4000';

export default defineConfig({
  noExternals: true,
  preset: 'node-server',
  sourcemap: false,
  minify: false,
  routeRules: {
    '/upload/**': { proxy: `${backendTarget}/api/upload/**` },
    '/api/upload/**': { proxy: `${backendTarget}/api/upload/**` },
  },
});
