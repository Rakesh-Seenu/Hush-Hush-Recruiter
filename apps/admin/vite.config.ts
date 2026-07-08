import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@hush/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  envDir: path.resolve(__dirname, "../.."),
  server: {
    port: 5173,
    strictPort: true,
    // Same-origin API in dev: the browser calls "/api/..." on this Vite origin
    // and Vite proxies it server-side to the backend. This is what makes the app
    // work in GitHub Codespaces, where the browser cannot reach localhost:8000
    // from the forwarded frontend origin. Leave VITE_API_BASE_URL empty in dev.
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
