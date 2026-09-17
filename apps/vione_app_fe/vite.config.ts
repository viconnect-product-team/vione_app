import { defineConfig } from '@lovable.dev/vite-tanstack-config';
export default defineConfig({
  vite: {
    server: {
      port: 5173,
      watch: {
        ignored: [
          '**/.output/**',
          '**/.tanstack/**',
          '**/release_apk/**',
          '**/android/**',
          '**/ios/**',
          '**/.turbo/**',
          '**/*.log',
        ],
      },
      proxy: {
        '/upload': {
          target: 'http://localhost:4000/api',
          changeOrigin: true,
        },
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
  },
});
