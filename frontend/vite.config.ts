import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import path from "path";
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: process.env.NODE_ENV === "production",
      },
      "/health": {
        target: process.env.BACKEND_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
    "process.env.BACKEND_URL": JSON.stringify(
      process.env.BACKEND_URL || "http://localhost:3001"
    ),
  },
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: {
      "core": path.resolve(__dirname, "../core"),
    },
  },
});
