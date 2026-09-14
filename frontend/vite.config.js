import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables from the repository root (..)
  const rootDir = path.resolve(__dirname, '..');
  const env = loadEnv(mode, rootDir, '');

  const ivyBaseUrl = env.IVY_BASE_URL || 'https://solve.ivy.homes';
  const ivyApiKey = env.IVY_API_KEY;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: ivyBaseUrl,
          changeOrigin: true,
          // Strip /api and route /v1/favourites to /v1/saved
          rewrite: (requestPath) => {
            const stripped = requestPath.replace(/^\/api/, '');
            if (stripped.startsWith('/v1/favourites')) {
              return stripped.replace('/v1/favourites', '/v1/saved');
            }
            return stripped;
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              if (ivyApiKey) {
                proxyReq.setHeader('X-API-Key', ivyApiKey);
              }
            });
          },
        },
      },
    },
  };
});

