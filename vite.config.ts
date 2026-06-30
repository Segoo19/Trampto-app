import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Assets estáticos (no hasheados) que se precachean
      includeAssets: [
        "favicon.ico",
        "favicon-32x32.png",
        "apple-touch-icon-180x180.png",
      ],
      manifest: {
        name: "Trampto",
        short_name: "Trampto",
        description:
          "Sella y verifica la integridad de tus documentos PDF con huella criptográfica SHA-256",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F6F7F9",
        theme_color: "#0D1B4B",
        lang: "es",
        dir: "ltr",
        categories: ["business", "productivity", "utilities"],
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "screenshot-wide.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "TRAMPTO en escritorio",
          },
          {
            src: "screenshot-narrow.png",
            sizes: "720x1280",
            type: "image/png",
            form_factor: "narrow",
            label: "TRAMPTO en móvil",
          },
        ],
        launch_handler: {
          client_mode: "navigate-existing",
        },
        display_override: ["standalone", "minimal-ui"],
        shortcuts: [
          {
            name: "Sellar documento",
            short_name: "Sellar",
            url: "/",
            icons: [
              { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            ],
          },
          {
            name: "Verificar",
            short_name: "Verificar",
            url: "/verificar",
            icons: [
              { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            ],
          },
        ],
      },
      workbox: {
        // Precache de TODO el app shell (index.html + JS/CSS/iconos/fuentes
        // locales). Así la app arranca offline sin depender de la red.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,json,webmanifest}"],
        globIgnores: ["**/screenshot-*.png"],
        // Cualquier navegación (incluida la primera a "/") se resuelve con el
        // index.html cacheado → la SPA arranca aunque no haya red, evitando el
        // error "can't reach this page" del contenedor de Windows.
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Fuentes de Google: cacheadas para que el offline también se vea bien.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "trampto-google-fonts-css" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "trampto-google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 31536000 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: { port: 5180 },
  preview: { port: 4173 },
});
