import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

// Fondo sólido para el maskable y el apple-touch, en vez del blanco por defecto
// del preset. Usamos el mismo azul claro con el que arranca el degradado del
// logo (icon-512.png), para que el relleno del área de seguridad continúe el
// fondo del propio icono en vez de recortarlo con un marco de otro color.
// Coherente con el background_color del manifest.
const ICON_BG = "#EBF2FF";

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
        background: ICON_BG,
      },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: {
        ...minimal2023Preset.apple.resizeOptions,
        background: ICON_BG,
      },
    },
  },
  images: ["public/icon-512.png"],
});
