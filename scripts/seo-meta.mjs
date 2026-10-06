// Metadatos SEO por ruta, compartidos por el prerender (scripts/prerender.mjs).
// Keyword principal por URL (ver docs/SEO.md → mapa de keywords). La marca va
// siempre en el título para dominar las búsquedas de "Trampto".
export const SITE = "https://trampto-app.vercel.app";
export const BRAND = "Trampto";
// Fecha de última revisión del contenido (dateModified en schema y sitemap).
export const UPDATED = "2026-10-06";

export const ROUTES = [
  {
    path: "/",
    title: "Trampto · Sellar y verificar documentos PDF online con SHA-256",
    description:
      "Trampto sella tus PDF con una huella SHA-256 única: Seal ID, fecha, certificado de integridad y enlace público de verificación. Gratis, sin subir el contenido.",
    h1: "Sella y verifica tus documentos PDF",
    crumb: null,
  },
  {
    path: "/verificar",
    title: "Verificar autenticidad de un documento PDF · Trampto",
    description:
      "Comprueba en segundos si un PDF es auténtico y no ha sido modificado: Trampto compara su huella SHA-256 con el sello original. Gratis y sin registro.",
    h1: "Verificar la autenticidad de un documento",
    crumb: "Verificar documento",
  },
  {
    path: "/about",
    title: "Qué es Trampto: integridad documental con sello SHA-256",
    description:
      "Trampto es una plataforma de sellado criptográfico de documentos para autónomos y pymes: demuestra que un PDF no ha cambiado, quién lo selló y cuándo.",
    h1: "Qué es Trampto",
    crumb: "Sobre Trampto",
  },
  {
    path: "/use-cases",
    title: "Casos de uso: sellar presupuestos, contratos y facturas · Trampto",
    description:
      "Cómo usar el sellado digital de Trampto para proteger presupuestos, facturas, contratos, entregas creativas y certificados frente a manipulaciones.",
    h1: "Casos de uso del sellado de documentos",
    crumb: "Casos de uso",
  },
  {
    path: "/blog",
    title: "Guías de integridad documental y PDF a prueba de manipulaciones · Trampto",
    description:
      "Guías breves: cómo proteger un PDF contra manipulaciones, sello digital vs firma electrónica y por qué el hash SHA-256 hace único a tu documento.",
    h1: "Guías sobre integridad documental",
    crumb: "Blog",
  },
  {
    path: "/comparativa",
    title: "Trampto vs firma electrónica, sello de tiempo y blockchain · Comparativa",
    description:
      "Comparativa: Trampto, DocuSign, sello de tiempo eIDAS y notarización blockchain. Qué prueba cada uno, coste, verificación y cuál elegir para tus PDF.",
    h1: "Trampto vs firma electrónica, sello de tiempo y blockchain",
    crumb: "Comparativa",
  },
  {
    path: "/glosario",
    title: "Glosario: hash SHA-256, sello digital y Seal ID · Trampto",
    description:
      "Qué es un hash, SHA-256, un sello digital, un Seal ID, la integridad documental y un sello de tiempo. Definiciones claras y breves.",
    h1: "Glosario de integridad documental",
    crumb: "Glosario",
  },
  {
    path: "/faq",
    title: "Preguntas frecuentes sobre sellar y verificar documentos · Trampto",
    description:
      "Respuestas sobre Trampto: qué es sellar un documento, privacidad, validez legal, cómo se verifica un PDF y cuánto cuesta.",
    h1: "Preguntas frecuentes",
    crumb: "Preguntas frecuentes",
  },
];
