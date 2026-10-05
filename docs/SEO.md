# SEO, AEO y GEO de Trampto

## Modelo de negocio (base de la estrategia)
SaaS freemium de **sellado criptográfico de PDF** (SHA-256 + Seal ID + enlace público de verificación) para autónomos y pymes. Gratis los primeros sellos; Plan Pro 1,99 €/mes. Competencia indirecta: firma electrónica (DocuSign, Signaturit), sellado de tiempo (TSA), notarización blockchain (OriginStamp, Stampery).

## Mapa de keywords (una intención principal por URL)
| Cluster | Keyword principal | Secundarias | URL |
|---|---|---|---|
| Marca | trampto | trampto app, trampto sellar documentos | `/` |
| Sellado (transaccional) | sellar documentos PDF online | sello digital PDF, certificar integridad PDF, sello de tiempo documento | `/` |
| Verificación | verificar autenticidad documento PDF | comprobar si un PDF ha sido modificado, verificar hash SHA-256 | `/verificar` |
| Casos de uso | proteger presupuestos y facturas | sellar contrato PDF, prueba de autoría de un diseño | `/use-cases` |
| Informacional | PDF a prueba de manipulaciones | sello digital vs firma electrónica, qué es un hash SHA-256 | `/blog` |
| Preguntas (AEO) | ¿tiene validez legal un sello digital? | ¿se sube mi documento?, cuánto cuesta | `/faq` |

Próximo paso de contenido: convertir cada bloque del blog en su propia URL (`/blog/<slug>`) de 800–1.500 palabras, añadirla a `scripts/seo-meta.mjs` y al sitemap. Una URL por pregunta es lo que más mueve las keywords informacionales y las citas en IA.

## Qué hace el código
- `scripts/prerender.mjs` (corre en `npm run build`): genera HTML estático por ruta con título, description, canonical, OG, JSON-LD y el contenido real. Así Google, Bing y crawlers de IA que no ejecutan JS (GPTBot, ClaudeBot, PerplexityBot) leen la página.
- JSON-LD `@graph`: Organization (con `alternateName` Trampto para búsquedas de marca), WebSite, SoftwareApplication (ofertas gratis/Pro), WebPage/AboutPage/CollectionPage, BreadcrumbList, HowTo en la home, FAQPage en `/faq`, `speakable` para asistentes de voz.
- Cada página arranca con un párrafo `.seo-summary`: respuesta directa y citable (formato que reutilizan los motores de respuesta).
- `public/llms.txt`: resumen de la marca para LLMs.
- `robots.txt` permite buscadores y crawlers de IA; `sitemap.xml` con las rutas públicas.
- Fuentes de Google cargadas sin bloquear el render; caché inmutable para `/assets/*`.

## Tareas fuera del código (imprescindibles para ser nº1)
1. **Dominio propio** (p. ej. trampto.com/.es): un `*.vercel.app` limita mucho la autoridad. Al migrar, cambiar `SITE` en `scripts/seo-meta.mjs`, `index.html`, `robots.txt`, `sitemap.xml` y `llms.txt`, con redirecciones 301.
2. Verificar en **Google Search Console** y **Bing Webmaster Tools** (Bing alimenta ChatGPT y Copilot) y enviar el sitemap.
3. Perfiles de marca y añadirlos a `sameAs` en `scripts/prerender.mjs`: LinkedIn, X, Product Hunt, Crunchbase, GitHub, Google Business Profile, Wikidata.
4. Menciones y enlaces: directorios SaaS (Capterra, G2, AlternativeTo, SaaSHub), artículos comparativos "alternativas a DocuSign", foros (Reddit, Forocoches, comunidades de autónomos). Las IAs citan marcas que aparecen en muchas fuentes de terceros.
5. Reseñas reales en Microsoft Store / G2: cuando existan, añadir `aggregateRating` al SoftwareApplication (nunca inventarlas).
6. Medir visibilidad en IA: preguntar periódicamente a ChatGPT, Perplexity, Gemini y Claude "¿cómo sellar un PDF para demostrar que no se ha modificado?" y "¿qué es Trampto?" y anotar si se cita la marca.
