import { useTranslation } from "react-i18next";

// Páginas informativas (About / Casos de uso / Blog). El contenido vive en los
// locales i18n (sección "info"); aquí solo se renderiza en el idioma activo.

const EMAIL_RE = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i;

// Convierte las direcciones de email de un texto en enlaces mailto.
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

interface Block {
  h: string;
  p?: string;
  list?: string[];
}
interface PageContent {
  title: string;
  sub: string;
  blocks: Block[];
}

// La ruta usa "use-cases"; en el JSON la clave es "useCases".
const PAGE_KEY: Record<string, string> = {
  about: "about",
  "use-cases": "useCases",
  blog: "blog",
  compare: "compare",
  glossary: "glossary",
};

const Info = ({
  page,
  navigate,
}: {
  page: string;
  navigate: (to: string) => void;
}) => {
  const { t } = useTranslation();
  const content = t(`info.${PAGE_KEY[page] ?? "about"}`, {
    returnObjects: true,
  }) as PageContent;

  return (
    <div className="info-page">
      <h1>{content.title}</h1>
      <p className="info-sub">{content.sub}</p>
      {content.blocks.map((block, i) => (
        <div className="info-block" key={i}>
          <h2>{block.h}</h2>
          {block.p && <p>{linkify(block.p)}</p>}
          {block.list && (
            <ul>
              {block.list.map((li, j) => (
                <li key={j}>{li}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <div className="center mt-24">
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          {t("footer.sealDocument")}
        </button>
      </div>
    </div>
  );
};

export default Info;
