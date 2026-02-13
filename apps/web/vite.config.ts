import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [reactRouter(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Handle upgrade for WebSocket/SSE connections
        ws: true,
        // Preserve the original headers (important for EventSource)
        headers: {
          'Connection': 'keep-alive',
        },
        // Configure timeout for SSE connections
        timeout: 0,
      }
    }
  }
});
