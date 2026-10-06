import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { routeKind, type RouteKind } from "./routes";

const BRAND = "TRAMPTO";

// Título por ruta, reutilizando los textos ya traducidos de cada página.
function titleFor(kind: RouteKind, t: (k: string) => string): string {
  switch (kind) {
    case "home":
      return t("seo.home");
    case "verify":
      return t("tabs.verify");
    case "about":
      return t("info.about.title");
    case "use-cases":
      return t("info.useCases.title");
    case "blog":
      return t("info.blog.title");
    case "compare":
      return t("info.compare.title");
    case "glossary":
      return t("info.glossary.title");
    case "privacy":
      return t("privacy.title");
    case "faq":
      return t("faq.title");
    case "api":
      return t("api.title");
    case "payment":
      return t("payment.planTitle");
    case "payment-success":
      return t("paymentSuccess.proTitle");
    case "profile":
      return t("profile.title");
    case "public-verify":
      return t("publicVerify.verifiedTitle");
    case "notfound":
      return t("notFound.title");
  }
}

// Descripción por ruta (solo donde tenemos un texto bueno ya traducido). En el
// resto se mantiene la meta description estática del index.html.
function descFor(kind: RouteKind, t: (k: string) => string): string | null {
  switch (kind) {
    case "faq":
      return t("faq.sub");
    case "about":
      return t("info.about.sub");
    case "use-cases":
      return t("info.useCases.sub");
    case "blog":
      return t("info.blog.sub");
    case "compare":
      return t("info.compare.sub");
    case "glossary":
      return t("info.glossary.sub");
    case "api":
      return t("api.lead");
    case "notfound":
      return t("notFound.text");
    default:
      return null;
  }
}

// Guarda la meta description original del HTML para restaurarla al salir de una
// página que la sobrescribe.
let baseDescription: string | null = null;

// Actualiza <title> y <meta description> según la ruta e idioma activos. Google
// renderiza JS y usa el <title> resultante, así que cada página tiene el suyo.
export function useSeo(path: string) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  useEffect(() => {
    const kind = routeKind(path);
    // Títulos orientados a keyword (seo.titles.<ruta>) donde existen; la home ya
    // empieza por la marca, así que no se le añade el sufijo.
    const seoKey = `seo.titles.${kind}`;
    if (kind === "home" && i18n.exists(seoKey)) document.title = t(seoKey);
    else if (i18n.exists(seoKey)) document.title = `${t(seoKey)} · ${BRAND}`;
    else document.title = `${titleFor(kind, t)} · ${BRAND}`;

    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    if (meta) {
      if (baseDescription === null) baseDescription = meta.content;
      const d = descFor(kind, t);
      meta.content = d ?? baseDescription;
    }
    document.documentElement.lang = lang;
  }, [path, lang, t, i18n]);
}
