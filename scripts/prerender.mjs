// Prerender SEO post-build (sin dependencias).
// La app es una SPA: sin esto, Google, Bing y los crawlers de IA (GPTBot,
// ClaudeBot, PerplexityBot…) que no ejecutan JS ven un <div id="root"> vacío.
// Aquí generamos dist/<ruta>/index.html con título, description, canonical,
// Open Graph, JSON-LD y el contenido de la página en HTML semántico dentro de
// #root. React usa createRoot (no hydrate), así que al montar reemplaza ese
// HTML sin conflictos; el splash lo tapa mientras tanto.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ROUTES, SITE } from "./seo-meta.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const es = JSON.parse(readFileSync(join(root, "src/i18n/locales/es.json"), "utf8"));
const template = readFileSync(join(dist, "index.html"), "utf8");
// Shell SPA limpio para rutas sin prerender (/v/*, /perfil, 404…): vercel.json
// reescribe ahí para no servirles el contenido de la home.
writeFileSync(join(dist, "spa.html"), template);

// FAQPage en bloque propio con el mismo id que usa Faq.tsx, que lo sustituye
// por la versión del idioma activo al montar (sin duplicados).
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE}/faq#faq`,
  mainEntity: es.faq.items.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const url = (p) => SITE + p;

// ---------------------------------------------------------------- JSON-LD
const ORG_ID = `${SITE}/#organization`;
const SITE_ID = `${SITE}/#website`;
const APP_ID = `${SITE}/#software`;

const organization = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "TRAMPTO",
  alternateName: ["Trampto", "Trampto App"],
  url: `${SITE}/`,
  logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png`, width: 512, height: 512 },
  image: `${SITE}/og-image.png`,
  email: "tramptooficial@gmail.com",
  description:
    "Trampto es una plataforma de sellado y verificación criptográfica de documentos PDF mediante huella SHA-256, Seal ID y enlace público de verificación.",
  knowsAbout: [
    "Sellado digital de documentos",
    "Integridad documental",
    "Hash SHA-256",
    "Verificación de autenticidad de PDF",
    "Evidencia digital",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "tramptooficial@gmail.com",
    availableLanguage: ["es", "en", "pt", "fr", "de", "it"],
  },
  sameAs: ["https://apps.microsoft.com/detail/9nmngk56g2mc"],
};

const website = {
  "@type": "WebSite",
  "@id": SITE_ID,
  url: `${SITE}/`,
  name: "Trampto",
  alternateName: "TRAMPTO",
  description: "Sella y verifica documentos PDF con huella SHA-256.",
  inLanguage: "es",
  publisher: { "@id": ORG_ID },
};

const software = {
  "@type": "SoftwareApplication",
  "@id": APP_ID,
  name: "Trampto",
  alternateName: "TRAMPTO",
  applicationCategory: "SecurityApplication",
  applicationSubCategory: "Sellado y verificación de documentos",
  operatingSystem: "Web, Windows, Android, iOS",
  url: `${SITE}/`,
  image: `${SITE}/og-image.png`,
  screenshot: [`${SITE}/screenshot-wide.png`, `${SITE}/screenshot-narrow.png`],
  inLanguage: ["es", "en", "pt", "fr", "de", "it", "ja", "zh-CN", "zh-TW"],
  description:
    "Sella tus documentos PDF con una huella criptográfica SHA-256 única y obtén un Seal ID, certificado de integridad y enlace público de verificación. El documento no sale de tu dispositivo.",
  featureList: [
    "Huella criptográfica SHA-256 calculada en el dispositivo",
    "Seal ID único con fecha y autoría",
    "Certificado de integridad en PDF",
    "Enlace público de verificación /v/{hash}",
    "Verificación de autenticidad de PDF en segundos",
    "Disponible en 9 idiomas",
  ],
  offers: [
    { "@type": "Offer", name: "Gratis", price: "0", priceCurrency: "EUR", description: "Sella gratis tus primeros documentos." },
    {
      "@type": "Offer",
      name: "Plan Pro",
      price: "1.99",
      priceCurrency: "EUR",
      description: "Sellado ilimitado.",
      priceSpecification: { "@type": "UnitPriceSpecification", price: "1.99", priceCurrency: "EUR", billingDuration: "P1M" },
    },
  ],
  publisher: { "@id": ORG_ID },
};

const howTo = {
  "@type": "HowTo",
  "@id": `${SITE}/#howto`,
  name: "Cómo sellar un documento PDF con Trampto",
  description: "Sella un PDF con huella SHA-256 y comparte su enlace de verificación en tres pasos.",
  totalTime: "PT1M",
  tool: { "@type": "HowToTool", name: "Trampto" },
  step: [
    { "@type": "HowToStep", position: 1, name: "Sube tu PDF", text: "Abre Trampto y selecciona el documento PDF que quieres proteger. El archivo se procesa en tu dispositivo." },
    { "@type": "HowToStep", position: 2, name: "Sella el documento", text: "Trampto calcula su huella SHA-256 y registra un Seal ID único con la fecha y la cuenta que lo sella." },
    { "@type": "HowToStep", position: 3, name: "Comparte y verifica", text: "Descarga el certificado de integridad y comparte el enlace público de verificación. Cualquiera puede comprobar que el documento no ha cambiado." },
  ],
};

function graphFor(r) {
  const pageId = `${url(r.path)}#webpage`;
  const pageType =
    r.path === "/about" ? "AboutPage" : r.path === "/blog" ? "CollectionPage" : "WebPage";
  const page = {
    "@type": pageType,
    "@id": pageId,
    url: url(r.path),
    name: r.title,
    description: r.description,
    inLanguage: "es",
    isPartOf: { "@id": SITE_ID },
    about: { "@id": APP_ID },
    primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}/og-image.png` },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".seo-summary"] },
  };
  const graph = [organization, website, software, page];
  if (r.crumb) {
    page.breadcrumb = { "@id": `${url(r.path)}#breadcrumb` };
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url(r.path)}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trampto", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: r.crumb, item: url(r.path) },
      ],
    });
  }
  if (r.path === "/") graph.push(howTo);
  if (r.path === "/blog") {
    page.hasPart = es.info.blog.blocks.map((b) => ({
      "@type": "Article",
      headline: b.h,
      abstract: b.p,
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
    }));
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

// ------------------------------------------------------- contenido estático
const NAV = [
  ["/", "Sellar documento"],
  ["/verificar", "Verificar documento"],
  ["/use-cases", "Casos de uso"],
  ["/blog", "Guías"],
  ["/faq", "Preguntas frecuentes"],
  ["/about", "Sobre Trampto"],
  ["/privacidad", "Privacidad"],
];
const nav = `<nav aria-label="Principal"><ul>${NAV.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join("")}</ul></nav>`;

const blocks = (bs) =>
  bs
    .map(
      (b) =>
        `<section><h2>${esc(b.h)}</h2>${b.p ? `<p>${esc(b.p)}</p>` : ""}${
          b.list ? `<ul>${b.list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""
        }</section>`
    )
    .join("");
const faqHtml = (items) =>
  items.map((it) => `<section><h3>${esc(it.q)}</h3><p>${esc(it.a)}</p></section>`).join("");
const steps = `<ol>${howTo.step.map((s) => `<li><strong>${esc(s.name)}.</strong> ${esc(s.text)}</li>`).join("")}</ol>`;

// Primer párrafo de cada página: respuesta directa y citable (AEO/GEO).
function body(r) {
  const h = es.hero;
  switch (r.path) {
    case "/":
      return `<p class="seo-summary"><strong>Trampto</strong> es una herramienta online para sellar y verificar documentos PDF. Calcula la huella criptográfica SHA-256 del archivo en tu dispositivo y registra un Seal ID único con fecha y autoría, de modo que cualquiera puede comprobar con un enlace público que el documento no ha sido modificado.</p>
<p>${esc(h.subPre + h.subStrong + h.subPost)}</p>
<h2>Cómo sellar un PDF en tres pasos</h2>${steps}
<h2>Qué obtienes al sellar</h2><ul>${software.featureList.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
<h2>Preguntas frecuentes</h2>${faqHtml(es.faq.items)}`;
    case "/verificar":
      return `<p class="seo-summary">Para verificar si un documento PDF es auténtico, súbelo en Trampto o abre su enlace de verificación: se recalcula su huella SHA-256 y se compara con el sello original. Si coincide, el documento es idéntico al sellado; si se ha cambiado un solo bit, la verificación falla.</p>
<h2>Cómo verificar un documento</h2><ol><li>Abre la pestaña Verificar.</li><li>Sube el PDF que has recibido o pega su enlace de verificación.</li><li>Comprueba el resultado: autenticidad, Seal ID, fecha y quién lo selló.</li></ol>`;
    case "/about":
      return `<p class="seo-summary">${esc(es.info.about.sub)} ${esc(es.info.about.blocks[0].p)}</p>${blocks(es.info.about.blocks)}`;
    case "/use-cases":
      return `<p class="seo-summary">${esc(es.info.useCases.sub)}</p>${blocks(es.info.useCases.blocks)}`;
    case "/blog":
      return `<p class="seo-summary">${esc(es.info.blog.sub)}</p>${blocks(es.info.blog.blocks).replace(/<h2>/g, "<article><h2>").replace(/<\/section>/g, "</article></section>")}`;
    case "/faq":
      return `<p class="seo-summary">${esc(es.faq.sub)}</p>${faqHtml(es.faq.items)}`;
  }
  return "";
}

function staticRoot(r) {
  return `<div id="root"><div class="seo-static"><header><a href="/"><strong>TRAMPTO</strong></a>${nav}</header><main><h1>${esc(
    r.h1
  )}</h1>${body(r)}<p><a href="/">Sellar un documento gratis con Trampto</a></p></main><footer><p>${esc(
    es.footer.tagline
  )}</p><p>Contacto: <a href="mailto:tramptooficial@gmail.com">tramptooficial@gmail.com</a></p></footer></div></div>`;
}

// ------------------------------------------------------------------ build
function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`meta ${key} no encontrada en index.html`);
  return html.replace(re, `$1${esc(value)}$2`);
}

for (const r of ROUTES) {
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(r.title)}</title>`);
  html = setMeta(html, "name", "description", r.description);
  html = setMeta(html, "property", "og:url", url(r.path));
  html = setMeta(html, "property", "og:title", r.title);
  html = setMeta(html, "property", "og:description", r.description);
  html = setMeta(html, "name", "twitter:title", r.title);
  html = setMeta(html, "name", "twitter:description", r.description);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url(r.path)}$2`);
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json" id="site-jsonld">${JSON.stringify(graphFor(r))}</script>`
  );
  if (r.path === "/faq")
    html = html.replace("</head>", `<script type="application/ld+json" id="faq-jsonld">${JSON.stringify(faqLd)}</script>\n</head>`);
  html = html.replace('<div id="root"></div>', staticRoot(r));
  if (!html.includes("seo-static")) throw new Error("no se pudo inyectar #root");

  const out = r.path === "/" ? join(dist, "index.html") : join(dist, r.path.slice(1), "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`prerender: ${r.path} → ${out.replace(root + "/", "")}`);
}
