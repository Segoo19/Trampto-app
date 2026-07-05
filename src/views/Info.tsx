import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

// Páginas informativas: About, Casos de uso y Blog. El contenido (prosa) se
// define por idioma y se elige según i18n; los textos cortos de UI van por t().

interface Block {
  title: string;
  body: ReactNode;
}
interface PageContent {
  title: string;
  sub: string;
  blocks: Block[];
}

const ES: Record<string, PageContent> = {
  about: {
    title: "Sobre TRAMPTO",
    sub: "Integridad documental, sin complicaciones.",
    blocks: [
      {
        title: "Qué es TRAMPTO",
        body: (
          <p>
            TRAMPTO aplica un sello criptográfico SHA-256 a tus documentos y
            genera una huella digital única. Desde ese momento, tu documento es
            único en internet: no existen dos iguales. Si alguien modifica un solo
            bit, la huella deja de coincidir y la alteración se detecta al
            instante.
          </p>
        ),
      },
      {
        title: "Integridad y autoría",
        body: (
          <p>
            Garantizamos que el <strong>contenido</strong> no ha cambiado y{" "}
            <strong>quién lo selló y cuándo</strong>: cada sello lleva un Seal ID
            único, la fecha y la cuenta que lo generó. Es complementario a las
            firmas tipo DocuSign.
          </p>
        ),
      },
      {
        title: "Para quién",
        body: (
          <p>
            Autónomos y PYMEs que necesitan proteger presupuestos, contratos,
            facturas o entregas sin aprender nada nuevo: subes, sellas y
            compartes.
          </p>
        ),
      },
      {
        title: "Contacto",
        body: (
          <p>
            Escríbenos a{" "}
            <a href="mailto:tramptooficial@gmail.com">tramptooficial@gmail.com</a>.
          </p>
        ),
      },
    ],
  },
  "use-cases": {
    title: "Casos de uso",
    sub: "Dónde marca la diferencia un documento único e inalterable.",
    blocks: [
      {
        title: "Presupuestos y facturas",
        body: (
          <p>
            Sella el presupuesto antes de enviarlo. Si el cliente devuelve una
            versión «retocada», la verificación lo delata en segundos.
          </p>
        ),
      },
      {
        title: "Contratos y acuerdos",
        body: (
          <p>
            Tras la firma, sella el PDF final. Cualquier modificación posterior
            invalida el sello y queda en evidencia.
          </p>
        ),
      },
      {
        title: "Entregas creativas",
        body: (
          <p>
            Diseños, manuscritos o informes: demuestra que tu entrega existía con
            ese contenido exacto en una fecha concreta, con un enlace público de
            verificación.
          </p>
        ),
      },
      {
        title: "Certificados y justificantes",
        body: (
          <ul>
            <li>Certificados académicos o de formación.</li>
            <li>Justificantes de entrega o recepción.</li>
            <li>Actas e informes técnicos.</li>
            <li>Documentación para licitaciones.</li>
          </ul>
        ),
      },
    ],
  },
  blog: {
    title: "Blog",
    sub: "Guías breves sobre integridad documental.",
    blocks: [
      {
        title: "Cómo hacer tu PDF a prueba de manipulaciones",
        body: (
          <p>
            Un PDF normal se edita en segundos. La forma robusta de protegerlo no
            es bloquearlo con contraseña (se rompe), sino registrar su huella
            SHA-256: un identificador único que cambia por completo si se altera
            un solo byte. Con TRAMPTO es automático.
          </p>
        ),
      },
      {
        title: "Sello digital vs firma electrónica",
        body: (
          <p>
            La firma electrónica responde a «¿quién firmó esto?». TRAMPTO responde
            a las dos preguntas a la vez: «¿esto sigue siendo lo que se selló?» y
            «¿quién lo selló y cuándo?». Son complementarios.
          </p>
        ),
      },
      {
        title: "Por qué tu documento es único a partir de su hash",
        body: (
          <p>
            SHA-256 produce 2²⁵⁶ huellas posibles: más que átomos hay en el
            universo observable. La probabilidad de que dos documentos distintos
            compartan huella es, a efectos prácticos, cero.
          </p>
        ),
      },
    ],
  },
};

const EN: Record<string, PageContent> = {
  about: {
    title: "About TRAMPTO",
    sub: "Document integrity, made simple.",
    blocks: [
      {
        title: "What TRAMPTO is",
        body: (
          <p>
            TRAMPTO applies a SHA-256 cryptographic seal to your documents and
            generates a unique digital fingerprint. From that moment on, your
            document is unique on the internet: no two are alike. If anyone
            modifies a single bit, the fingerprint no longer matches and the
            change is detected instantly.
          </p>
        ),
      },
      {
        title: "Integrity and authorship",
        body: (
          <p>
            We guarantee that the <strong>content</strong> hasn't changed and{" "}
            <strong>who sealed it and when</strong>: every seal carries a unique
            Seal ID, the date and the account that created it. It's complementary
            to e-signatures like DocuSign.
          </p>
        ),
      },
      {
        title: "Who it's for",
        body: (
          <p>
            Freelancers and SMBs who need to protect quotes, contracts, invoices
            or deliverables without learning anything new: upload, seal and share.
          </p>
        ),
      },
      {
        title: "Contact",
        body: (
          <p>
            Email us at{" "}
            <a href="mailto:tramptooficial@gmail.com">tramptooficial@gmail.com</a>.
          </p>
        ),
      },
    ],
  },
  "use-cases": {
    title: "Use cases",
    sub: "Where a unique, unalterable document makes the difference.",
    blocks: [
      {
        title: "Quotes and invoices",
        body: (
          <p>
            Seal the quote before sending it. If the client returns a "tweaked"
            version, verification exposes it in seconds.
          </p>
        ),
      },
      {
        title: "Contracts and agreements",
        body: (
          <p>
            After signing, seal the final PDF. Any later modification invalidates
            the seal and becomes evident.
          </p>
        ),
      },
      {
        title: "Creative deliverables",
        body: (
          <p>
            Designs, manuscripts or reports: prove your delivery existed with that
            exact content on a specific date, with a public verification link.
          </p>
        ),
      },
      {
        title: "Certificates and receipts",
        body: (
          <ul>
            <li>Academic or training certificates.</li>
            <li>Delivery or receipt confirmations.</li>
            <li>Minutes and technical reports.</li>
            <li>Documentation for tenders.</li>
          </ul>
        ),
      },
    ],
  },
  blog: {
    title: "Blog",
    sub: "Short guides on document integrity.",
    blocks: [
      {
        title: "How to make your PDF tamper-proof",
        body: (
          <p>
            A normal PDF can be edited in seconds. The robust way to protect it is
            not password-locking it (that breaks), but registering its SHA-256
            fingerprint: a unique identifier that changes entirely if a single
            byte is altered. With TRAMPTO it's automatic.
          </p>
        ),
      },
      {
        title: "Digital seal vs electronic signature",
        body: (
          <p>
            An e-signature answers "who signed this?". TRAMPTO answers both
            questions at once: "is this still what was sealed?" and "who sealed it
            and when?". They're complementary.
          </p>
        ),
      },
      {
        title: "Why your document is unique from its hash",
        body: (
          <p>
            SHA-256 produces 2²⁵⁶ possible fingerprints: more than there are atoms
            in the observable universe. The odds of two different documents
            sharing a fingerprint are, in practice, zero.
          </p>
        ),
      },
    ],
  },
};

const Info = ({
  page,
  navigate,
}: {
  page: string;
  navigate: (to: string) => void;
}) => {
  const { t, i18n } = useTranslation();
  const set = i18n.language.startsWith("en") ? EN : ES;
  const content = set[page] ?? set.about;

  return (
    <div className="info-page">
      <h1>{content.title}</h1>
      <p className="info-sub">{content.sub}</p>
      {content.blocks.map((block) => (
        <div className="info-block" key={block.title}>
          <h2>{block.title}</h2>
          {block.body}
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
