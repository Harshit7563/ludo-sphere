import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_PORT = 4001;

/** Dev-only: old tabs reconnecting after `npm run dev` often cause EPIPE/ECONNRESET on the WS proxy. */
function ignoreBenignProxyErrors(proxy) {
  proxy.on('error', (err) => {
    if (err.code === 'EPIPE' || err.code === 'ECONNRESET') return;
    console.error('[vite proxy]', err.message);
  });
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': { target: `http://localhost:${API_PORT}`, changeOrigin: true },
      '/socket.io': {
        target: `http://localhost:${API_PORT}`,
        ws: true,
        configure: ignoreBenignProxyErrors,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
