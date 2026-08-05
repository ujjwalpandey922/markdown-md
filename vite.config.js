import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite configuration for the markdown viewer.
// - Dev server binds to 0.0.0.0:3000 so the supervisor + preview URL work.
// - allowedHosts: true accepts external preview hostnames.
// - @ alias preserves parity with the previous CRA/craco jsconfig paths.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
      protocol: "wss",
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
  },
  build: {
    outDir: "build",
    sourcemap: false,
  },
});
