import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS } from "../i18n";

// Nombres NATIVOS de cada idioma (no se traducen: cada uno en su propia lengua,
// para que un usuario los reconozca aunque la app esté en otro idioma).
const NATIVE: Record<string, string> = {
  es: "Español",
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  it: "Italiano",
  ja: "日本語",
};

// Código corto que se muestra en el botón compacto de la cabecera.
const SHORT: Record<string, string> = {
  es: "ES",
  en: "EN",
  "zh-CN": "简",
  "zh-TW": "繁",
  fr: "FR",
  de: "DE",
  pt: "PT",
  it: "IT",
  ja: "日",
};

const GlobeIcon = ({ size = 17 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
  </svg>
);

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = i18n.resolvedLanguage ?? i18n.language ?? "es";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (lng: string) => {
    i18n.changeLanguage(lng); // el detector con caches:["localStorage"] lo persiste
    setOpen(false);
  };

  return (
    <div className="lang-select" ref={ref}>
      <button
        type="button"
        className="lang-select-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.label")}
        title={t("lang.label")}
      >
        <GlobeIcon />
        <span className="lang-select-code">{SHORT[current] ?? "ES"}</span>
      </button>
      {open && (
        <ul className="lang-menu" role="listbox">
          {SUPPORTED_LANGS.map((lng) => (
            <li key={lng} role="option" aria-selected={lng === current}>
              <button
                type="button"
                className={lng === current ? "active" : ""}
                onClick={() => choose(lng)}
                lang={lng}
              >
                {NATIVE[lng]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
