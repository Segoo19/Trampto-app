// Detección del CONTEXTO de ejecución de la web.
//
// La app de Huawei/Google Play es un TWA que carga esta misma web en vivo. Las
// tiendas Android (Huawei con cuenta individual, Google Play) NO permiten cobrar
// bienes/servicios digitales con una pasarela de terceros (Stripe) dentro de la
// app: exigen su propio sistema de pago. Para cumplirlo SIN cambiar la web,
// ocultamos los botones de pago SOLO cuando la web corre dentro de la app Android.
//
// Cómo se detecta: un TWA lanza el documento con el referrer "android-app://<paquete>".
// La navegación SPA no cambia el referrer, así que lo capturamos una vez al
// arrancar y lo persistimos en sessionStorage para toda la sesión de la app.
//
// IMPORTANTE: NO usamos `display-mode: standalone` a propósito. Eso también sería
// true en la versión instalada de Microsoft Store (que SÍ lleva pago y ya está
// aprobada) y en cualquier PWA instalada en escritorio. Aquí solo queremos afectar
// a las apps Android. En un navegador normal (donde se suscriben las empresas),
// esto es siempre false y todo funciona como hasta ahora.

const FLAG_KEY = "trampto_is_android_app";

function detect(): boolean {
  try {
    if (
      typeof document !== "undefined" &&
      typeof document.referrer === "string" &&
      document.referrer.startsWith("android-app://")
    ) {
      return true;
    }
    if (
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(FLAG_KEY) === "1"
    ) {
      return true;
    }
    // Atajo manual para pruebas: localStorage.trampto_force_app = "1"
    if (
      typeof localStorage !== "undefined" &&
      localStorage.getItem("trampto_force_app") === "1"
    ) {
      return true;
    }
  } catch {
    /* entornos sin storage/document */
  }
  return false;
}

const IS_ANDROID_APP = detect();
if (IS_ANDROID_APP) {
  try {
    sessionStorage.setItem(FLAG_KEY, "1");
  } catch {
    /* ignore */
  }
}

// ¿La web corre dentro de la app Android (Huawei / Google Play)?
export function isAndroidApp(): boolean {
  return IS_ANDROID_APP;
}

// ¿Debemos ocultar el pago dentro de la app? (alias semántico)
export function hidePaymentInApp(): boolean {
  return IS_ANDROID_APP;
}
