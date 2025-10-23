// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],

// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
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
            src: "../image.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "../image.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/your-api-domain\.com\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
