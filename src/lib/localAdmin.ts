import type { AppSession } from "../types";
import { isAdminEmail } from "./usage";

// Acceso de administrador LOCAL para desarrollo: permite entrar con el email
// de admin y una contraseña fija sin pasar por la confirmación de correo de
// Supabase (en localhost el envío de correo es poco práctico).
//
// SEGURIDAD: solo se habilita en desarrollo (`npm run dev`) o si se activa
// explícitamente con VITE_ALLOW_LOCAL_ADMIN=true. En el build de producción
// queda desactivado, para no dejar una puerta trasera de administrador.

const KEY = "trampto_local_admin";
const DEV_PASSWORD = import.meta.env.VITE_ADMIN_DEV_PASSWORD ?? "trampto@19";

export const LOCAL_ADMIN_ENABLED: boolean =
  import.meta.env.DEV || import.meta.env.VITE_ALLOW_LOCAL_ADMIN === "true";

export function canUseLocalAdmin(email: string, password: string): boolean {
  return (
    LOCAL_ADMIN_ENABLED && isAdminEmail(email) && password === DEV_PASSWORD
  );
}

export function getLocalAdmin(): AppSession | null {
  if (!LOCAL_ADMIN_ENABLED) return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const email = (JSON.parse(raw) as { email?: string }).email;
    if (!email || !isAdminEmail(email)) return null;
    return {
      user: {
        id: "local-admin",
        email,
        user_metadata: { full_name: "Administrador" },
      },
      isLocalAdmin: true,
    };
  } catch {
    return null;
  }
}

export function setLocalAdmin(email: string) {
  localStorage.setItem(KEY, JSON.stringify({ email }));
  window.dispatchEvent(new Event("trampto-auth"));
}

export function clearLocalAdmin() {
  if (localStorage.getItem(KEY)) {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("trampto-auth"));
  }
}
