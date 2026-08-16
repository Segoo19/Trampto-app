// Clasificación de rutas en un solo sitio, para que la selección de vista (App),
// el título SEO (useSeo) y la 404 usen exactamente la misma lógica.
export type RouteKind =
  | "home"
  | "verify"
  | "about"
  | "use-cases"
  | "blog"
  | "privacy"
  | "faq"
  | "api"
  | "payment"
  | "payment-success"
  | "profile"
  | "public-verify"
  | "notfound";

export function routeKind(path: string): RouteKind {
  const l = (path || "/").toLowerCase();
  if (l === "/" || l === "") return "home";
  if (l.startsWith("/v/")) return "public-verify";
  if (l === "/verificar") return "verify";
  if (l === "/about") return "about";
  if (l === "/use-cases") return "use-cases";
  if (l === "/blog") return "blog";
  if (l === "/privacidad" || l === "/privacy") return "privacy";
  if (l === "/faq") return "faq";
  if (l === "/api-key") return "api";
  if (l === "/payment") return "payment";
  if (l === "/payment-success") return "payment-success";
  if (l === "/perfil" || l === "/profile" || l === "/auth") return "profile";
  return "notfound";
}

// Páginas de contenido donde tiene sentido un CTA fijo en móvil para llevar a
// sellar (no en la home ni en las pantallas que ya son la propia acción).
export const CONTENT_ROUTES: RouteKind[] = [
  "about",
  "use-cases",
  "blog",
  "privacy",
  "faq",
];
