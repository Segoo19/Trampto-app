import { useCallback, useEffect, useState } from "react";
import type { AppCtx } from "../App";
import { supabase } from "../lib/supabase";
import {
  cancelSubscription,
  countMySeals,
  getSubscription,
  FREE_LIMIT,
} from "../lib/usage";
import AuthForm from "../components/AuthForm";
import { CrownIcon, UserIcon } from "../components/Icons";

// Perfil integrado en la app, versión minimalista del ProfilePage de la web:
// nombre de usuario, email, plan con detalles y cancelación, y cierre de sesión.
// Sin sesión, esta misma pantalla es el "Iniciar sesión".
const Profile = ({ ctx, onLogout }: { ctx: AppCtx; onLogout: () => void }) => {
  const { session, usage, refreshUsage, navigate } = ctx;
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [sealCount, setSealCount] = useState<number | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const meta = session.user.user_metadata as Record<string, unknown> | null;
    setUsername(
      (meta?.full_name as string) ??
        session.user.email?.split("@")[0] ??
        ""
    );
    getSubscription(session.user.id).then(setSubscription);
    countMySeals(session.user.id).then(setSealCount);
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  if (!session) {
    return (
      <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
        <div className="result-head">
          <div className="result-badge" style={{ background: "#eceef3", color: "var(--navy)" }}>
            <UserIcon size={30} />
          </div>
          <h2>Iniciar sesión</h2>
          <p className="sub">Accede a tu cuenta o crea una nueva.</p>
        </div>
        <AuthForm onAuthed={() => refreshUsage()} />
      </div>
    );
  }

  const handleSaveUsername = async () => {
    const name = username.trim();
    if (name.length < 3 || name.length > 20) {
      setMessage("El nombre debe tener entre 3 y 20 caracteres.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setSaving(true);
    try {
      // Igual que la web: metadatos de auth + perfil (este último, best-effort)
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (error) throw error;
      try {
        await supabase
          .from("profiles")
          .update({ display_name: name })
          .eq("user_id", session.user.id);
      } catch {
        /* el esquema de profiles puede variar */
      }
      setMessage("✓ Nombre actualizado");
    } catch {
      setMessage("No se pudo actualizar el nombre.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    setCancelling(true);
    const ok = await cancelSubscription(subscription);
    setCancelling(false);
    setConfirmCancel(false);
    if (ok) {
      setMessage(
        `Suscripción cancelada. Mantienes Pro hasta ${new Date(
          subscription.expires_at
        ).toLocaleDateString("es-ES")}.`
      );
      await refreshUsage();
      load();
    } else {
      setMessage("No se pudo cancelar. Escríbenos a tramptooficial@gmail.com.");
    }
  };

  const plan = usage?.isAdmin ? "ADMIN" : usage?.isPro ? "PRO" : "FREE";

  return (
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="result-head">
        <div className="result-badge" style={{ background: "#eceef3", color: "var(--navy)" }}>
          <UserIcon size={30} />
        </div>
        <h2>Mi perfil</h2>
      </div>

      <div className="form" style={{ marginBottom: 18 }}>
        <label htmlFor="profile-username">Nombre de usuario</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            id="profile-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-burgundy"
            onClick={handleSaveUsername}
            disabled={saving}
          >
            {saving ? <span className="spinner spinner-dark" /> : "Guardar"}
          </button>
        </div>
      </div>

      <div className="profile-row">
        <span className="label">Email</span>
        <span className="value">{session.user.email}</span>
      </div>
      <div className="profile-row">
        <span className="label">Plan</span>
        <span className="value">
          {plan === "FREE" ? (
            <span className="pill pill-free">FREE · {usage?.freeUsed ?? 0}/{FREE_LIMIT}</span>
          ) : (
            <span className="pill pill-pro">
              <CrownIcon size={12} /> {plan}
            </span>
          )}
        </span>
      </div>
      <div className="profile-row">
        <span className="label">Documentos sellados</span>
        <span className="value">{sealCount ?? "—"}</span>
      </div>
      {subscription && (
        <>
          <div className="profile-row">
            <span className="label">Suscrito desde</span>
            <span className="value">
              {new Date(subscription.created_at).toLocaleDateString("es-ES")}
            </span>
          </div>
          <div className="profile-row">
            <span className="label">Próxima renovación</span>
            <span className="value">
              {new Date(subscription.expires_at).toLocaleDateString("es-ES")} · 1,99 €
            </span>
          </div>
        </>
      )}

      {message && (
        <div className="notice notice-warn mt-16" style={{ marginBottom: 0 }}>
          {message}
        </div>
      )}

      <div className="actions mt-24">
        {!usage?.isPro && (
          <button className="btn btn-gold" onClick={() => navigate("/payment")}>
            <CrownIcon size={16} /> Hazte Pro
          </button>
        )}
        {usage?.isPro && !usage.isAdmin && subscription && !confirmCancel && (
          <button
            className="btn btn-outline"
            onClick={() => setConfirmCancel(true)}
          >
            Cancelar suscripción
          </button>
        )}
        <button className="btn btn-ghost" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>

      {confirmCancel && (
        <div className="notice notice-error mt-16">
          <span>
            ¿Seguro? Perderás el acceso Pro al final del periodo facturado.
          </span>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <span className="spinner spinner-dark" /> : "Sí, cancelar"}
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setConfirmCancel(false)}
          >
            Mantener PRO
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
