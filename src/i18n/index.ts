import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import es from "./locales/es.json";
import en from "./locales/en.json";

// i18n de Trampto: español por defecto. Detecta el idioma del navegador;
// si no es inglés, cae a español. La elección manual se guarda en localStorage.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    nonExplicitSupportedLngs: true, // mapea en-US, en-GB… → en
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "trampto_lang",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false }, // React ya escapa
  });

export default i18n;
