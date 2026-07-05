import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";

// i18n de Trampto.
// - Detección automática por el idioma del navegador (order: navigator).
// - Si el idioma detectado no está soportado, cae a español (es).
// - Sin selector manual ni persistencia en localStorage.
// - Carga diferida: cada locale es su propio chunk y solo se descarga el idioma
//   activo (más el fallback es cuando el activo no es es). Nunca los 9 de golpe.

export const SUPPORTED_LANGS = [
  "es",
  "en",
  "zh-CN",
  "zh-TW",
  "fr",
  "de",
  "pt",
  "it",
  "ja",
] as const;

// Glob de los JSON existentes; Vite genera un chunk independiente por archivo.
const localeLoaders = import.meta.glob("./locales/*.json");

i18n
  .use(
    resourcesToBackend((lng: string) => {
      const loader = localeLoaders[`./locales/${lng}.json`];
      // Si un idioma soportado aún no tiene archivo, resolvemos vacío y i18next
      // usará el fallback (es) para todas sus claves.
      return loader ? loader() : Promise.resolve({ default: {} });
    })
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Claves sin traducir → español; y el idioma no soportado también cae a es.
    fallbackLng: "es",
    supportedLngs: [...SUPPORTED_LANGS],
    // NO usamos nonExplicitSupportedLngs ni load:"languageOnly": ambos colapsan
    // zh-CN y zh-TW a la misma base "zh" y el chino tradicional quedaría
    // inalcanzable. La normalización de región la hacemos en
    // convertDetectedLanguage (más abajo).
    detection: {
      order: ["navigator"],
      caches: [], // sin persistencia: siempre re-detecta el navegador
      // Normaliza el código del navegador a uno soportado:
      //  - Chino por escritura: TW/HK/MO/Hant → tradicional (zh-TW); resto → zh-CN.
      //  - Los demás: se quita la región (en-US→en, fr-FR→fr, pt-BR→pt, ja-JP→ja…).
      //  - Los no soportados (ru, ar, ko…) caen a es vía fallbackLng.
      convertDetectedLanguage: (lng: string) => {
        const l = lng.toLowerCase();
        if (l.startsWith("zh")) {
          return /tw|hk|mo|hant/.test(l) ? "zh-TW" : "zh-CN";
        }
        return l.split("-")[0];
      },
    },
    interpolation: { escapeValue: false }, // React ya escapa
    react: { useSuspense: false }, // carga async sin Suspense
  });

// Refleja el idioma activo en <html lang> (selectores :lang() de CSS para CJK
// y accesibilidad). Se dispara también con la detección inicial.
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
