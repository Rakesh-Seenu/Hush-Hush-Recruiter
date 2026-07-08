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
  },
});
