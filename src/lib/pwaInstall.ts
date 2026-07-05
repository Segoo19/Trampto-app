// Lógica de instalación de la PWA. Captura el evento beforeinstallprompt lo
// antes posible (puede dispararse antes de que React monte) y expone helpers
// para lanzar el prompt nativo, detectar iOS y saber si ya está instalada.

// URL de la ficha de Microsoft Store. Déjala VACÍA hasta que Trampto esté
// publicado; entonces pon aquí la URL (p. ej. "https://apps.microsoft.com/detail/XXXXXXXX")
// y el botón ofrecerá también "Conseguir en Microsoft Store".
export const MICROSOFT_STORE_URL = "";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

export function hasInstallPrompt(): boolean {
  return deferredPrompt !== null;
}

export function onInstallChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") {
    deferredPrompt = null;
    notify();
  }
  return outcome === "accepted";
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOSDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ se hace pasar por Mac; detecta la pantalla táctil
  const iPadOS = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}
