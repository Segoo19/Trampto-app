import { useCallback, useEffect, useState } from "react";
import type { AppCtx } from "../App";
import { supabase } from "../lib/supabase";
import {
  apiBaseUrl,
  activateSubscription,
  ensureCompany,
  getCompany,
  getMonthlyApiUsage,
  regenerateApiKey,
  startCheckout,
  type Company,
} from "../lib/usage";
import CompanyDemo from "../components/CompanyDemo";
import { CopyButton } from "../components/Bits";
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  RefreshIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "../components/Icons";

// Plan Empresas: clave API + guía de integración. Basado en la página
// /api-key de la web original (endpoints api-seal y api-verify).
const ApiKey = ({ ctx }: { ctx: AppCtx }) => {
  const { session, usage, refreshUsage, navigate } = ctx;
  const [company, setCompany] = useState<Company | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<number | null>(null);
  const [activating, setActivating] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const justPaid = params.get("success") === "true";
  const canceled = params.get("canceled") === "true";

  const loadCompany = useCallback(async () => {
    if (!session) {
      setCompany(null);
      setLoadingCompany(false);
      return;
    }
    setLoadingCompany(true);
    const found = await getCompany(session);
    setCompany(found);
    setLoadingCompany(false);
    if (found?.id) {
      getMonthlyApiUsage(found.id).then(setMonthlyUsage);
    }
  }, [session]);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  // Vuelta de Stripe: activar suscripción y asegurar empresa + clave
  // (mismo papel que el webhook, desde el cliente).
  useEffect(() => {
    if (!justPaid || !session) return;
    const activate = async () => {
      setActivating(true);
      await activateSubscription(session.user.id);
      const created = await ensureCompany(session);
      if (created) setCompany(created);
      await refreshUsage();
      setActivating(false);
    };
    activate();
  }, [justPaid, session, refreshUsage]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError(null);
    try {
      window.location.href = await startCheckout("api");
    } catch (err) {
      console.error("api checkout error:", err);
      setError("No se pudo iniciar el pago. Inténtalo de nuevo.");
      setCheckoutLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!company) return;
    setRegenerating(true);
    const newKey = await regenerateApiKey(company.id);
    if (newKey) setCompany({ ...company, api_key: newKey });
    setRegenerating(false);
  };

  const base = apiBaseUrl();
  const keyForDocs = company?.api_key ?? "TU_CLAVE_API";
  const hasActiveCompany =
    !!company && company.subscription_status === "active" && !!company.api_key;

  const sealSnippet = `// Sellar un documento (Node.js / navegador)
const res = await fetch("${base}/api-seal", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${keyForDocs}",
  },
  body: JSON.stringify({
    file: "<PDF en base64>",
    filename: "documento.pdf",
    format: "pdf",
  }),
});
const data = await res.json();
// → { success, hash, verifyUrl, sealedAt, sealId }`;

  const verifySnippet = `# Verificar un documento (endpoint público)
curl ${base}/api-verify/<huella-sha256>
# → { "valid": true, "filename": "...", "sealedAt": "...", "sealId": "..." }`;

  return (
    <div className="card">
      <div className="result-head">
        <div className="result-badge" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
          <KeyIcon size={30} />
        </div>
        <h2>API para empresas</h2>
        <p className="sub">
          Integra el sellado y la verificación de TRAMPTO en tu web. Toda la
          documentación y la demo son públicas; tu <strong>clave API se activa
          al suscribirte</strong> (plan Empresas, 1,99 €/mes).
        </p>
      </div>

      {canceled && (
        <div className="notice notice-warn">
          <ShieldAlertIcon size={18} />
          Pago cancelado. Puedes intentarlo de nuevo cuando quieras.
        </div>
      )}

      {activating && (
        <div className="card center" style={{ boxShadow: "none" }}>
          <span
            className="spinner spinner-dark"
            style={{ width: 20, height: 20, display: "inline-block" }}
          />
          <p className="mt-8" style={{ color: "var(--muted)", fontSize: 14 }}>
            Activando tu plan Empresas…
          </p>
        </div>
      )}

      {/* Sin sesión → directo a suscribirse para conseguir la clave */}
      {!session && (
        <div className="apikey-cta">
          <p className="apikey-cta-title">
            <KeyIcon size={16} /> Suscríbete para conseguir tu clave API
          </p>
          <p className="apikey-cta-sub">
            Toda la documentación y la demo de abajo son públicas. Tu clave se
            genera al suscribirte al plan Empresas (1,99 €/mes).
          </p>
          <button
            className="btn btn-gold btn-lg"
            onClick={() => navigate("/payment")}
          >
            <KeyIcon size={17} /> Suscribirme · 1,99 €/mes
          </button>
        </div>
      )}

      {/* Admin sin empresa en BD (p. ej. modo admin local en desarrollo) */}
      {session && usage?.isAdmin && !loadingCompany && !hasActiveCompany && !activating && (
        <div className="notice" style={{ background: "var(--gold-soft)", border: "1px solid #e3d09a", color: "#8a6c14" }}>
          <KeyIcon size={18} />
          <span>
            Cuenta admin. La clave API real aparecerá aquí cuando el backend
            esté configurado (functions <code>api-seal</code>/<code>api-verify</code>{" "}
            desplegadas y <code>setup-admin.sql</code> ejecutado). Mientras tanto,
            usa el panel de pruebas de abajo con cualquier clave.
          </span>
        </div>
      )}

      {/* Con sesión pero sin plan activo → checkout */}
      {session && !usage?.isAdmin && !loadingCompany && !hasActiveCompany && !activating && (
        <div className="center">
          {justPaid ? (
            <div className="notice notice-warn" style={{ textAlign: "left" }}>
              <ShieldAlertIcon size={18} />
              <span>
                Pago recibido. Tu clave se está generando — pulsa
                «Actualizar» en unos segundos.
              </span>
              <button className="btn btn-outline btn-sm" onClick={loadCompany}>
                Actualizar
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 12 }}>
                Suscríbete al plan Empresas para activar tu clave API:
              </p>
              <button
                className="btn btn-gold btn-lg"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <KeyIcon size={18} /> Suscribirme y activar mi clave · 1,99 €/mes
                  </>
                )}
              </button>
              <p className="stripe-note">Pago seguro con Stripe · Sin permanencia</p>
            </>
          )}
        </div>
      )}

      {/* Dashboard de la clave */}
      {session && hasActiveCompany && company && (
        <>
          <div className="notice" style={{ background: "var(--green-bg)", border: "1px solid #bfe5d0", color: "#115c36" }}>
            <ShieldCheckIcon size={18} />
            Suscripción Empresas activa para {company.email}
          </div>

          <div className="api-section">
            <h3>Tu clave API</h3>
            <div className="api-key-box">
              <code>
                {showKey
                  ? company.api_key
                  : "trp_••••••••••••••••••••••••••••"}
              </code>
              <button
                className="copy-btn"
                title={showKey ? "Ocultar" : "Mostrar"}
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
              <CopyButton value={company.api_key!} label="Copiar clave API" />
              <button
                className="copy-btn"
                title="Regenerar clave"
                onClick={handleRegenerate}
                disabled={regenerating}
              >
                <RefreshIcon size={16} className={regenerating ? "spin" : undefined} />
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>
              Guárdala en una variable de entorno, nunca en el código. Si la
              regeneras, la anterior deja de funcionar.
              {monthlyUsage !== null && (
                <> · Uso este mes: <strong>{monthlyUsage}</strong> documentos</>
              )}
            </p>
          </div>
        </>
      )}

      {/* Demo de integración: VISIBLE PARA TODOS (también empresas no
          suscriptoras) para que vean cómo queda en su web antes de pagar */}
      <div className="api-section">
        <h3>Míralo en acción: TRAMPTO en tu web</h3>
        <CompanyDemo />
      </div>

      {/* Documentación (visible siempre) */}
      <div className="api-section">
        <h3>Sellar por API</h3>
        <pre className="codeblock">{sealSnippet}</pre>
      </div>
      <div className="api-section">
        <h3>Verificar por API (público)</h3>
        <pre className="codeblock">{verifySnippet}</pre>
      </div>

      {error && (
        <div className="notice notice-error mt-16">
          <ShieldAlertIcon size={18} />
          {error}
        </div>
      )}

      {/* Panel de pruebas contra el backend real: SOLO cuenta admin */}
      {usage?.isAdmin && <AdminTester apiKey={company?.api_key ?? null} />}

      <div className="center mt-24">
        <button className="btn btn-ghost" onClick={() => navigate("/")}>
          ← Volver
        </button>
      </div>
    </div>
  );
};

// Panel exclusivo de la cuenta admin: prueba la clave API contra el propio
// TRAMPTO (sella un PDF de prueba y verifica su huella) y muestra el
// resultado crudo, para comprobar que la integración funciona.
const AdminTester = ({ apiKey }: { apiKey: string | null }) => {
  const [key, setKey] = useState(apiKey ?? "");
  const [running, setRunning] = useState<"seal" | "verify" | null>(null);
  const [result, setResult] = useState<{
    ok: boolean;
    title: string;
    body: string;
  } | null>(null);

  useEffect(() => {
    if (apiKey) setKey(apiKey);
  }, [apiKey]);

  const base = apiBaseUrl();

  // Comprueba si una edge function está desplegada. Un GET simple no dispara
  // preflight CORS, así que el gateway responde 404 NOT_FOUND legible cuando
  // la función no existe (en vez del críptico "Failed to fetch" del POST).
  const probeDeployed = async (fn: string): Promise<boolean | null> => {
    try {
      const r = await fetch(`${base}/${fn}`, {
        method: "GET",
        signal: AbortSignal.timeout(8000),
      });
      const t = await r.text();
      if (r.status === 404 && /not.?found/i.test(t)) return false;
      return true;
    } catch {
      return null; // sin red / desconocido
    }
  };

  const notDeployedResult = (fn: string) => ({
    ok: false,
    title: `✗ La función ${fn} no está desplegada todavía`,
    body:
      `El gateway de Supabase responde 404 NOT_FOUND para ${fn}.\n\n` +
      `Despliégala con la CLI de Supabase:\n` +
      `  supabase functions deploy ${fn}\n\n` +
      `(Necesita los secretos SUPABASE_SERVICE_ROLE_KEY y, para api-seal, la tabla companies con tu clave.)`,
  });

  const testSeal = async () => {
    setRunning("seal");
    setResult(null);
    try {
      const deployed = await probeDeployed("api-seal");
      if (deployed === false) {
        setResult(notDeployedResult("api-seal"));
        return;
      }
      // PDF mínimo generado al vuelo para la prueba
      const { PDFDocument, StandardFonts } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      const page = doc.addPage([300, 200]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      page.drawText(`Prueba API TRAMPTO ${new Date().toISOString()}`, {
        x: 20,
        y: 160,
        size: 9,
        font,
      });
      const bytes = await doc.save();
      let binary = "";
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      const base64 = btoa(binary);

      const res = await fetch(`${base}/api-seal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key },
        body: JSON.stringify({
          file: base64,
          filename: "prueba-api.pdf",
          format: "pdf",
        }),
        signal: AbortSignal.timeout(15000),
      });
      const text = await res.text();
      setResult({
        ok: res.ok,
        title: res.ok
          ? `✓ api-seal respondió ${res.status}: la clave funciona`
          : `✗ api-seal respondió ${res.status}`,
        body: text.slice(0, 600),
      });
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      setResult(
        /failed to fetch|networkerror/i.test(m)
          ? notDeployedResult("api-seal")
          : {
              ok: false,
              title: "✗ No se pudo conectar con api-seal",
              body: m,
            }
      );
    } finally {
      setRunning(null);
    }
  };

  const testVerify = async () => {
    setRunning("verify");
    setResult(null);
    try {
      const deployed = await probeDeployed("api-verify");
      if (deployed === false) {
        setResult(notDeployedResult("api-verify"));
        return;
      }
      // Usa la huella del último documento sellado registrado
      const { data } = await supabase
        .from("sealed_documents")
        .select("hash")
        .order("created_at", { ascending: false })
        .limit(1)
        .abortSignal(AbortSignal.timeout(12000));
      const hash = data?.[0]?.hash ?? "0".repeat(64);

      const res = await fetch(`${base}/api-verify/${hash}`, {
        signal: AbortSignal.timeout(15000),
      });
      const text = await res.text();
      setResult({
        ok: res.ok,
        title: res.ok
          ? `✓ api-verify respondió ${res.status}: el endpoint público funciona`
          : `✗ api-verify respondió ${res.status}`,
        body: text.slice(0, 600),
      });
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      setResult(
        /failed to fetch|networkerror/i.test(m)
          ? notDeployedResult("api-verify")
          : {
              ok: false,
              title: "✗ No se pudo conectar con api-verify",
              body: m,
            }
      );
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="admin-panel">
      <h3>Panel admin · Probar la API contra TRAMPTO</h3>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
        Simula la integración de un cliente: sella un PDF de prueba con tu
        clave y verifica una huella real. Solo visible para la cuenta admin.
      </p>
      <div className="form" style={{ marginBottom: 12 }}>
        <label htmlFor="admin-key">Clave API a probar</label>
        <input
          id="admin-key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="trp_…"
          spellCheck={false}
        />
      </div>
      <div className="actions" style={{ justifyContent: "flex-start" }}>
        <button
          className="btn btn-burgundy btn-sm"
          onClick={testSeal}
          disabled={!key || running !== null}
        >
          {running === "seal" ? (
            <span className="spinner spinner-dark" />
          ) : (
            <>
              <CheckIcon size={15} /> Probar sellado (api-seal)
            </>
          )}
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={testVerify}
          disabled={running !== null}
        >
          {running === "verify" ? (
            <span className="spinner spinner-dark" />
          ) : (
            <>
              <CheckIcon size={15} /> Probar verificación (api-verify)
            </>
          )}
        </button>
      </div>
      {result && (
        <div className={`test-result ${result.ok ? "ok" : "fail"}`}>
          <strong>{result.title}</strong>
          <pre>{result.body}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiKey;
