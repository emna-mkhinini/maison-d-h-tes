import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Le "proxy" redirige /api et /uploads vers le serveur Node (port 5000).
// Comme ça, dans React on écrit simplement fetch("/api/maisons").
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
});
