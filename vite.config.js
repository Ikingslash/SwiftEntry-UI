import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      outDir: "dist", // ✅ ensure it uses your real build folder
      workbox: {
        globDirectory: "dist", // ✅ correct directory for Vite builds
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"], // updated pattern
        globIgnores: ["**/node_modules/**/*", "sw.js", "workbox-*.js"],
      },
      manifest: {
        name: "MICRO COVERAGE",
        short_name: "MicroCoverage",
        description: "Track micro coverage for communities",
        theme_color: "#ffffff",
        background_color: "#F5F5F5",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/image.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/image.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
