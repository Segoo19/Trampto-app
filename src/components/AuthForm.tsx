import { useState } from "react";
import { supabase } from "../lib/supabase";
import { canUseLocalAdmin, setLocalAdmin } from "../lib/localAdmin";

interface Props {
  onAuthed: () => void;
}

// Acceso por email + contraseña vía Supabase Auth, igual que la web.
// Atajo de desarrollo: la cuenta admin entra con su contraseña fija sin
// pasar por la confirmación de correo (ver lib/localAdmin.ts).
const AuthForm = ({ onAuthed }: Props) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    // Atajo admin local (solo en desarrollo): entra sin verificar el correo
    if (canUseLocalAdmin(email.trim(), password)) {
      setLocalAdmin(email.trim());
      onAuthed();
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) setError(error.message);
        else if (data.session) onAuthed();
        else setInfo("Revisa tu correo para confirmar la cuenta.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) setError(error.message);
        else if (data.session) onAuthed();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="auth-password">Contraseña</label>
        <input
          id="auth-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      {info && <p className="form-info">{info}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? (
          <span className="spinner" />
        ) : mode === "register" ? (
          "Crear cuenta"
        ) : (
          "Iniciar sesión"
        )}
      </button>
      <button
        type="button"
        className="form-switch"
        onClick={() => {
          setMode(mode === "register" ? "login" : "register");
          setError(null);
          setInfo(null);
        }}
      >
        {mode === "register"
          ? "¿Ya tienes cuenta? Inicia sesión"
          : "¿No tienes cuenta? Regístrate"}
      </button>
    </form>
  );
};

export default AuthForm;
