import { useState } from "react";
import type { AppCtx } from "../App";
import { supabase } from "../lib/supabase";
import { startCheckout } from "../lib/usage";
import {
  CheckIcon,
  CrownIcon,
  KeyIcon,
  ShieldAlertIcon,
} from "../components/Icons";

// Un único plan (1,99 €/mes) enfocado a empresas, válido también para
// autónomos. La suscripción ocurre sin salir de esta pantalla: si no hay
// sesión, se pide email + contraseña aquí mismo y se va directo al pago.
const Payment = ({ ctx }: { ctx: AppCtx }) => {
  const { session, usage, navigate } = ctx;
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Con sesión: directo al pago de Stripe.
  const subscribe = async () => {
    if (!session) {
      setShowForm(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      window.location.href = await startCheckout("api");
    } catch {
      setError("No se pudo iniciar el pago. Inténtalo de nuevo en unos segundos.");
      setLoading(false);
    }
  };

  // Sin sesión: crear/identificar la cuenta con email + contraseña aquí mismo
  // y continuar al pago en el mismo paso, sin salir de la suscripción.
  const subscribeWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: up } = await supabase.auth.signUp({ email, password });
      let active = up?.session ?? null;
      if (!active) {
        const { data: si, error: siErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        active = si?.session ?? null;
        if (!active) {
          setError(
            siErr?.message?.toLowerCase().includes("invalid")
              ? "Email o contraseña incorrectos."
              : "Revisa tu correo para confirmar la cuenta y vuelve a intentarlo."
          );
          setLoading(false);
          return;
        }
      }
      // Ya hay sesión activa → al pago seguro de Stripe
      window.location.href = await startCheckout("api");
    } catch {
      setError("No se pudo continuar. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  if (usage?.isPro) {
    return (
      <div className="card paywall">
        <div className="crown">
          <CrownIcon size={28} />
        </div>
        <h2>Ya eres {usage.isAdmin ? "Admin" : "Pro"}</h2>
        <p style={{ color: "var(--muted)", fontSize: 14.5 }}>
          Tienes documentos ilimitados y acceso a la API.
        </p>
        <div className="actions mt-24" style={{ justifyContent: "center" }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/")}>
            Empezar a sellar
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate("/api-key")}>
            <KeyIcon size={17} /> Mi clave API
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card paywall">
      <div className="pill pill-pro" style={{ margin: "0 auto 14px" }}>
        <KeyIcon size={13} /> Para empresas
      </div>
      <h2>Plan Empresas</h2>
      <p style={{ color: "var(--muted)", fontSize: 14.5 }}>
        Sella, verifica e <strong>integra TRAMPTO en tu web</strong> con tu propia
        clave API. Pensado para empresas, perfecto también para autónomos.
      </p>
      <div className="price">
        1,99 € <span>/ mes</span>
      </div>

      <ul className="perks">
        <li>
          <CheckIcon size={17} /> Documentos ilimitados
        </li>
        <li>
          <CheckIcon size={17} /> Clave API para integrar el sellado en tu web
        </li>
        <li>
          <CheckIcon size={17} /> Sellado y verificación por API REST
        </li>
        <li>
          <CheckIcon size={17} /> Certificado de integridad y enlace público
        </li>
        <li>
          <CheckIcon size={17} /> Constancia de autoría y fecha (Seal ID)
        </li>
        <li>
          <CheckIcon size={17} /> Cancela cuando quieras
        </li>
      </ul>

      {showForm && !session ? (
        <form className="form" onSubmit={subscribeWithEmail} style={{ maxWidth: 320, margin: "0 auto", textAlign: "left" }}>
          <p style={{ fontSize: 13.5, color: "var(--muted)", textAlign: "center" }}>
            Introduce tu email para suscribirte:
          </p>
          <div>
            <label htmlFor="sub-email">Email</label>
            <input
              id="sub-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="sub-pass">Contraseña</label>
            <input
              id="sub-pass"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-gold btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : "Ir al pago seguro →"}
          </button>
        </form>
      ) : (
        <button
          className="btn btn-gold btn-lg"
          onClick={subscribe}
          disabled={loading}
          style={{ minWidth: 260 }}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <CrownIcon size={18} /> Suscribirme · 1,99 €/mes
            </>
          )}
        </button>
      )}

      {error && (
        <div className="notice notice-error mt-16" style={{ textAlign: "left" }}>
          <ShieldAlertIcon size={18} />
          {error}
        </div>
      )}

      <p className="stripe-note">Pago seguro procesado por Stripe · Sin permanencia</p>
      <button className="btn btn-ghost mt-8" onClick={() => navigate("/")}>
        ← Volver
      </button>
    </div>
  );
};

export default Payment;
