import { useTranslation } from "react-i18next";

const LANGS = ["es", "en"] as const;

// Selector de idioma ES/EN. La elección persiste en localStorage (lo gestiona
// i18next-browser-languagedetector con la clave trampto_lang).
const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language ?? "es").startsWith(
    "en"
  )
    ? "en"
    : "es";

  return (
    <div className="lang-switch" role="group" aria-label={t("lang.label")}>
      {LANGS.map((lng) => (
        <button
          key={lng}
          type="button"
          className={current === lng ? "active" : ""}
          aria-pressed={current === lng}
          onClick={() => i18n.changeLanguage(lng)}
        >
          {t(`lang.${lng}`)}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
