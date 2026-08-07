import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase, isNetworkError } from "../lib/supabase";
import { canUseLocalAdmin, setLocalAdmin } from "../lib/localAdmin";

// Aborta una promesa de auth si tarda demasiado, para no dejar el botón girando
// de forma indefinida cuando el backend no responde.
function withTimeout<T>(p: Promise<T>, ms = 15000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

interface Props {
  onAuthed: () => void;
}

// Acceso por email + contraseña vía Supabase Auth, igual que la web.
// Atajo de desarrollo: la cuenta admin entra con su contraseña fija sin
// pasar por la confirmación de correo (ver lib/localAdmin.ts).
const AuthForm = ({ onAuthed }: Props) => {
  const { t } = useTranslation();
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
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          })
        );
        if (error) setError(mapAuthError(error.message));
        else if (data.session) onAuthed();
        else setInfo(t("auth.checkEmail"));
      } else {
        const { data, error } = await withTimeout(
          supabase.auth.signInWithPassword({ email, password })
        );
        if (error) setError(mapAuthError(error.message));
        else if (data.session) onAuthed();
      }
    } catch (err) {
      // Errores lanzados (timeout, "Failed to fetch"…): mensaje de red claro.
      setError(
        isNetworkError(err) || (err instanceof Error && err.message === "timeout")
          ? t("auth.networkError")
          : t("auth.genericError")
      );
    } finally {
      setLoading(false);
    }
  };

  // Traduce el mensaje de Supabase: los de red se sustituyen por uno claro;
  // el resto (credenciales, email sin confirmar…) se muestran tal cual.
  const mapAuthError = (msg: string): string =>
    isNetworkError(msg) ? t("auth.networkError") : msg;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="auth-email">{t("auth.email")}</label>
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
        <label htmlFor="auth-password">{t("auth.password")}</label>
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
          t("auth.createAccount")
        ) : (
          t("auth.signIn")
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
        {mode === "register" ? t("auth.haveAccount") : t("auth.noAccount")}
      </button>
      <p className="auth-privacy">
        {t("auth.privacyPre")}{" "}
        <a href="/privacidad.html" target="_blank" rel="noreferrer">
          {t("auth.privacyLink")}
        </a>
      </p>
    </form>
  );
};

export default AuthForm;
