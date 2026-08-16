import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface FaqItem {
  q: string;
  a: string;
}
interface FaqContent {
  title: string;
  sub: string;
  items: FaqItem[];
}

// FAQ con acordeón nativo (<details>) + datos estructurados FAQPage inyectados
// dinámicamente para que Google pueda mostrar el rich result de preguntas.
const Faq = ({ navigate }: { navigate: (to: string) => void }) => {
  const { t } = useTranslation();
  const c = t("faq", { returnObjects: true }) as FaqContent;
  const items = Array.isArray(c?.items) ? c.items : [];

  useEffect(() => {
    if (!items.length) return;
    const ld = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a },
      })),
    };
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "faq-jsonld";
    el.textContent = JSON.stringify(ld);
    document.head.appendChild(el);
    return () => {
      document.getElementById("faq-jsonld")?.remove();
    };
  }, [items]);

  return (
    <div className="info-page">
      <h1>{c?.title ?? "FAQ"}</h1>
      {c?.sub && <p className="info-sub">{c.sub}</p>}
      <div className="faq-list">
        {items.map((it, i) => (
          <details className="faq-item" key={i}>
            <summary>{it.q}</summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
      <div className="center mt-24">
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          {t("footer.sealDocument")}
        </button>
      </div>
    </div>
  );
};

export default Faq;
