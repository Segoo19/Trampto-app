// Forma mínima de sesión que usa la app. Una sesión real de Supabase
// (@supabase/supabase-js `Session`) es estructuralmente compatible, y la
// "sesión admin local" de desarrollo también encaja aquí.
export interface AppSession {
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown> | null;
  };
  isLocalAdmin?: boolean;
}
