import type { ReactNode } from "react";

// Páginas informativas minimalistas: About, Casos de uso y Blog.
// Contenido resumido de las secciones equivalentes de la web.

interface Block {
  title: string;
  body: ReactNode;
}

interface PageContent {
  title: string;
  sub: string;
  blocks: Block[];
}

const PAGES: Record<string, PageContent> = {
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
            único en internet: no existen dos iguales. Si alguien modifica un
            solo bit, la huella deja de coincidir y la alteración se detecta al
            instante.
          </p>
        ),
      },
      {
        title: "Integridad y autoría",
        body: (
          <>
            <p>
              Garantizamos dos cosas: que el <strong>contenido</strong> no ha
              cambiado, y <strong>quién lo selló y cuándo</strong>. Cada sello
              lleva un <strong>Seal ID único</strong>, la fecha y hora exactas y
              la cuenta que lo generó, todo registrado de forma inalterable.
            </p>
            <p>
              Así, además de detectar cualquier modificación, queda constancia
              verificable de la autoría y el momento del sellado. Es
              complementario a las firmas tipo DocuSign: ellas acreditan la
              identidad legal del firmante; nosotros acreditamos que lo sellado
              sigue intacto y quién y cuándo lo selló.
            </p>
          </>
        ),
      },
      {
        title: "Para quién",
        body: (
          <p>
            Autónomos y PYMEs que necesitan proteger presupuestos, contratos,
            facturas o entregas sin aprender nada nuevo: subes, sellas y
            compartes. La tecnología se queda fuera de tu camino.
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
            —una cifra, una cláusula, una fecha— invalida el sello y queda en
            evidencia.
          </p>
        ),
      },
      {
        title: "Entregas creativas",
        body: (
          <p>
            Diseños, manuscritos, maquetas o informes: demuestra que tu entrega
            existía con ese contenido exacto en una fecha concreta, con un
            enlace público de verificación.
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
          <>
            <p>
              Un PDF normal se edita en segundos con cualquier herramienta. La
              forma robusta de protegerlo no es bloquearlo con contraseña (se
              rompe), sino registrar su huella SHA-256: un identificador único
              que cambia por completo si se altera un solo byte.
            </p>
            <p>
              Con TRAMPTO ese proceso es automático: subes el documento, se
              sella página a página con una marca casi invisible y obtienes la
              huella, el certificado y un enlace para que cualquiera verifique
              el original.
            </p>
          </>
        ),
      },
      {
        title: "Sello digital vs firma electrónica",
        body: (
          <>
            <p>
              La firma electrónica (DocuSign, Adobe Sign…) responde a «¿quién
              firmó esto?». TRAMPTO responde a las dos preguntas a la vez:
              <strong> «¿esto sigue siendo exactamente lo que se selló?»</strong>{" "}
              y <strong>«¿quién lo selló y cuándo?»</strong>.
            </p>
            <p>
              Porque cada sello deja constancia inalterable de su autoría: un
              Seal ID único, la fecha y hora exactas y la cuenta que lo generó.
              Así garantizamos a la vez la integridad del contenido y la autoría
              del sellado.
            </p>
            <p>
              Y es complementario a tu firma: puedes firmar un contrato con tu
              proveedor de firma y después sellarlo con TRAMPTO para que nadie
              pueda alterar el resultado sin que se note.
            </p>
          </>
        ),
      },
      {
        title: "Por qué tu documento es único a partir de su hash",
        body: (
          <>
            <p>
              SHA-256 produce 2²⁵⁶ huellas posibles: más combinaciones que
              átomos tiene el universo observable. La probabilidad de que dos
              documentos distintos compartan huella es, a efectos prácticos,
              cero.
            </p>
            <p>
              Por eso, cuando TRAMPTO registra la huella de tu documento, ese
              documento pasa a ser único en internet: no existen dos iguales.
            </p>
          </>
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
  const content = PAGES[page] ?? PAGES.about;

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
          Sellar un documento
        </button>
      </div>
    </div>
  );
};

export default Info;
