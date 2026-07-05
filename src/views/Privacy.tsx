import { useTranslation } from "react-i18next";

// Política de privacidad. Ruta pública /privacidad (sin login). El contenido
// vive en los locales i18n (sección "privacy"); se renderiza en el idioma activo.

const EMAIL_RE = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i;

function linkify(text: string) {
  return text.split(EMAIL_RE).map((part, i) =>
    EMAIL_RE.test(part) ? (
      <a key={i} href={`mailto:${part}`}>
        {part}
      </a>
    ) : (
      part
    )
  );
}

interface Section {
  h: string;
  p?: string | string[];
  items?: string[];
}
interface PrivacyContent {
  title: string;
  updated: string;
  back: string;
  sections: Section[];
}

const Privacy = ({ navigate }: { navigate: (to: string) => void }) => {
  const { t } = useTranslation();
  const c = t("privacy", { returnObjects: true }) as PrivacyContent;
  const paras = (p?: string | string[]): string[] =>
    !p ? [] : Array.isArray(p) ? p : [p];

  return (
    <div className="info-page">
      <h1>{c.title}</h1>
      <p className="info-sub">{c.updated}</p>
      {c.sections.map((s, i) => (
        <div className="info-block" key={i}>
          <h2>{s.h}</h2>
          {paras(s.p).map((para, j) => (
            <p key={j}>{linkify(para)}</p>
          ))}
          {s.items && (
            <ul>
              {s.items.map((it, j) => (
                <li key={j}>{linkify(it)}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <div className="center mt-24">
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          {c.back}
        </button>
      </div>
    </div>
  );
};

export default Privacy;
