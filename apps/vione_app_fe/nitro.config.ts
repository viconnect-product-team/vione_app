import { defineConfig } from "nitro/config";

// Bundle all dependencies into the server output instead of relying on
// @vercel/nft (nf3) dependency tracing, which fails with CommonJS
// compatibility errors on certain packages during the self-hosted Docker
// (node-server preset) build. Auto-loaded and merged by Nitro.
export default defineConfig({
  noExternals: true,
  preset: 'node-server',
});
