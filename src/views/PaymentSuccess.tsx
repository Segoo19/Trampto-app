import { useEffect, useState } from "react";
import type { AppCtx } from "../App";
import { supabase } from "../lib/supabase";
import { activateSubscription } from "../lib/usage";
import { ShieldCheckIcon } from "../components/Icons";

// Vuelta de Stripe Checkout. Igual que la web (PaymentSuccess.tsx):
// se activa la suscripción al instante con un upsert en `subscriptions`
// (el webhook de Stripe actúa como respaldo del estado real del cobro).
const PaymentSuccess = ({ ctx }: { ctx: AppCtx }) => {
  const { refreshUsage, navigate } = ctx;
  const [state, setState] = useState<"working" | "done" | "no_session">(
    "working"
  );

  useEffect(() => {
    const activate = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setState("no_session");
        return;
      }
      await activateSubscription(session.user.id);
      await refreshUsage();
      setState("done");
    };
    activate();
  }, [refreshUsage]);

  if (state === "working") {
    return (
      <div className="card center">
        <span
          className="spinner spinner-dark"
          style={{ width: 22, height: 22, display: "inline-block" }}
        />
        <p className="mt-16" style={{ color: "var(--muted)" }}>
          Activando tu cuenta Pro…
        </p>
      </div>
    );
  }

  if (state === "no_session") {
    return (
      <div className="card center">
        <h2>Pago completado</h2>
        <p className="mt-8" style={{ color: "var(--muted)" }}>
          Inicia sesión con tu cuenta para activar Pro.
        </p>
        <div className="mt-24">
          <button className="btn btn-primary" onClick={() => navigate("/payment")}>
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="result-head">
        <div className="result-badge">
          <ShieldCheckIcon size={32} />
        </div>
        <h2>¡Ya eres Pro!</h2>
        <p className="sub">
          Pago completado. Documentos ilimitados activados en tu cuenta.
        </p>
      </div>
      <div className="center">
        <button className="btn btn-primary btn-lg" onClick={() => navigate("/")}>
          Sellar documentos
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
