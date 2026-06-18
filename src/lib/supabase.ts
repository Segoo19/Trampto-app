import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Señal de cancelación para consultas: evita que la interfaz se quede
// colgada si el backend no responde (p. ej. proyecto Supabase pausado).
export function dbTimeout(ms = 12000): AbortSignal {
  return AbortSignal.timeout(ms);
}
