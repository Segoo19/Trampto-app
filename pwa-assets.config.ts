import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

// Genera los iconos PWA (incluido el maskable) a partir del logo cuadrado.
// Salida en public/: pwa-64x64.png, pwa-192x192.png, pwa-512x512.png,
// maskable-icon-512x512.png, apple-touch-icon-180x180.png
export default defineConfig({
  preset: minimal2023Preset,
  images: ["public/icon-512.png"],
});
