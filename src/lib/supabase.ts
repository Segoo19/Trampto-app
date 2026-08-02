import { createClient } from "@supabase/supabase-js";

// Fallback embebido para que la app funcione aunque falten las variables de
// entorno en el despliegue (p. ej. Vercel sin VITE_SUPABASE_* configuradas):
// sin esto, createClient(undefined, …) hace que cada login vaya a
// "undefined/auth/v1/…" y falle con "Failed to fetch".
// La anon key es PÚBLICA por diseño (viaja en el bundle igualmente); la
// seguridad la da la RLS de Supabase, no el secreto de esta clave.
const FALLBACK_URL = "https://rhmmrryqgizcqivczjpp.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobW1ycnlxZ2l6Y3FpdmN6anBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDAwNTIsImV4cCI6MjA4NjkxNjA1Mn0.lDicR_pMwbucZnJG_3hIh7GINDCUEAu_wdtNj6PA5-8";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ¿Un error de red/timeout (backend caído, sin conexión, CORS)? Sirve para
// mostrar un mensaje claro en vez del críptico "Failed to fetch".
export function isNetworkError(err: unknown): boolean {
  const msg =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";
  return /failed to fetch|networkerror|load failed|timeout|aborted|fetch/i.test(
    msg
  );
}

// Señal de cancelación para consultas: evita que la interfaz se quede
// colgada si el backend no responde (p. ej. proyecto Supabase pausado).
export function dbTimeout(ms = 12000): AbortSignal {
  return AbortSignal.timeout(ms);
}
