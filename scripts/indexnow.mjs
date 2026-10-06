// Avisa a Bing (y por tanto a Copilot/ChatGPT search) y Yandex de las URLs
// actualizadas. Ejecutar tras desplegar:  node scripts/indexnow.mjs
import { ROUTES, SITE } from "./seo-meta.mjs";
const key = "f77e877848194211e22574f0954d8602";
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key,
    keyLocation: `${SITE}/${key}.txt`,
    urlList: ROUTES.map((r) => SITE + r.path),
  }),
});
console.log("IndexNow:", res.status, res.statusText);
