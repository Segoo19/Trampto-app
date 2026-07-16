import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

// Fondo navy sólido de la marca (#0D1B4B) para el icono maskable y el
// apple-touch, en vez del blanco por defecto del preset. Coherente con el
// theme_color y el background_color del manifest.
const NAVY = "#0D1B4B";

// Genera los iconos PWA a partir del logo cuadrado (public/icon-512.png).
// Salida en public/: pwa-64x64.png, pwa-192x192.png, pwa-512x512.png,
// maskable-icon-512x512.png, apple-touch-icon-180x180.png
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: {
        ...minimal2023Preset.maskable.resizeOptions,
        background: NAVY,
      },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: {
        ...minimal2023Preset.apple.resizeOptions,
        background: NAVY,
      },
    },
  },
  images: ["public/icon-512.png"],
});
