import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useLocalPrice } from "../lib/currency";
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
  const { t } = useTranslation();
  const price = useLocalPrice();
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
      setError(t("api.checkoutError"));
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
  const keyForDocs = company?.api_key ?? "YOUR_API_KEY";
  const hasActiveCompany =
    !!company && company.subscription_status === "active" && !!company.api_key;

  const sealSnippet = `// Seal a document (Node.js / browser)
const res = await fetch("${base}/api-seal", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${keyForDocs}",
  },
  body: JSON.stringify({
    file: "<PDF in base64>",
    filename: "document.pdf",
    format: "pdf",
  }),
});
const data = await res.json();
// -> { success, hash, verifyUrl, sealedAt, sealId }`;

  const verifySnippet = `# Verify a document (public endpoint)
curl ${base}/api-verify/<sha256-fingerprint>
# -> { "valid": true, "filename": "...", "sealedAt": "...", "sealId": "..." }`;

  return (
    <div className="card">
      <div className="result-head">
        <div className="result-badge" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
          <KeyIcon size={30} />
        </div>
        <h2>{t("api.title")}</h2>
        <p className="sub">{t("api.lead", { price: price.display })}</p>
      </div>

      {canceled && (
        <div className="notice notice-warn">
          <ShieldAlertIcon size={18} />
          {t("api.canceled")}
        </div>
      )}

      {activating && (
        <div className="card center" style={{ boxShadow: "none" }}>
          <span
            className="spinner spinner-dark"
            style={{ width: 20, height: 20, display: "inline-block" }}
          />
          <p className="mt-8" style={{ color: "var(--muted)", fontSize: 14 }}>
            {t("api.activating")}
          </p>
        </div>
      )}

      {/* Sin sesión → directo a suscribirse para conseguir la clave */}
      {!session && (
        <div className="apikey-cta">
          <p className="apikey-cta-title">
            <KeyIcon size={16} /> {t("api.subscribeTitle")}
          </p>
          <p className="apikey-cta-sub">{t("api.subscribeSub", { price: price.display })}</p>
          <button
            className="btn btn-gold btn-lg"
            onClick={() => navigate("/payment")}
          >
            <KeyIcon size={17} /> {t("payment.subscribe", { price: price.display })}
          </button>
          {price.hasLocal && (
            <p className="apikey-cta-sub" style={{ marginTop: 8, marginBottom: 0 }}>
              {t("payment.approxNote", { eur: price.eurText })}
            </p>
          )}
        </div>
      )}

      {/* Admin sin empresa en BD (p. ej. modo admin local en desarrollo) */}
      {session && usage?.isAdmin && !loadingCompany && !hasActiveCompany && !activating && (
        <div className="notice" style={{ background: "var(--gold-soft)", border: "1px solid #e3d09a", color: "#8a6c14" }}>
          <KeyIcon size={18} />
          <span>{t("api.adminNote")}</span>
        </div>
      )}

      {/* Con sesión pero sin plan activo → checkout */}
      {session && !usage?.isAdmin && !loadingCompany && !hasActiveCompany && !activating && (
        <div className="center">
          {justPaid ? (
            <div className="notice notice-warn" style={{ textAlign: "left" }}>
              <ShieldAlertIcon size={18} />
              <span>{t("api.paidGenerating")}</span>
              <button className="btn btn-outline btn-sm" onClick={loadCompany}>
                {t("api.refresh")}
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 12 }}>
                {t("api.subscribePrompt")}
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
                    <KeyIcon size={18} /> {t("api.subscribeActivate", { price: price.display })}
                  </>
                )}
              </button>
              <p className="stripe-note">{t("payment.stripeNote")}</p>
              {price.hasLocal && (
                <p className="stripe-note">{t("payment.approxNote", { eur: price.eurText })}</p>
              )}
            </>
          )}
        </div>
      )}

      {/* Dashboard de la clave */}
      {session && hasActiveCompany && company && (
        <>
          <div className="notice" style={{ background: "var(--green-bg)", border: "1px solid #bfe5d0", color: "#115c36" }}>
            <ShieldCheckIcon size={18} />
            {t("api.activeFor", { email: company.email })}
          </div>

          <div className="api-section">
            <h3>{t("api.yourApiKey")}</h3>
            <div className="api-key-box">
              <code>
                {showKey
                  ? company.api_key
                  : "trp_••••••••••••••••••••••••••••"}
              </code>
              <button
                className="copy-btn"
                title={showKey ? t("bits.hide") : t("bits.show")}
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
              <CopyButton value={company.api_key!} label={t("api.copyApiKey")} />
              <button
                className="copy-btn"
                title={t("api.regenerate")}
                onClick={handleRegenerate}
                disabled={regenerating}
              >
                <RefreshIcon size={16} className={regenerating ? "spin" : undefined} />
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>
              {t("api.keyHint")}
              {monthlyUsage !== null && (
                <> · {t("api.usageThisMonth", { count: monthlyUsage })}</>
              )}
            </p>
          </div>
        </>
      )}

      {/* Demo de integración: VISIBLE PARA TODOS (también empresas no
          suscriptoras) para que vean cómo queda en su web antes de pagar */}
      <div className="api-section">
        <h3>{t("api.demoSectionTitle")}</h3>
        <CompanyDemo />
      </div>

      {/* Documentación (visible siempre) */}
      <div className="api-section">
        <h3>{t("api.sealApiTitle")}</h3>
        <pre className="codeblock">{sealSnippet}</pre>
      </div>
      <div className="api-section">
        <h3>{t("api.verifyApiTitle")}</h3>
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
          {t("payment.back")}
        </button>
      </div>
    </div>
  );
};

// Panel exclusivo de la cuenta admin: prueba la clave API contra el propio
// TRAMPTO. Los mensajes de diagnóstico son técnicos y solo los ve el admin,
// por eso se mantienen en inglés (neutro) y no se traducen.
const AdminTester = ({ apiKey }: { apiKey: string | null }) => {
  const { t } = useTranslation();
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

  const probeDeployed = async (fn: string): Promise<boolean | null> => {
    try {
      const r = await fetch(`${base}/${fn}`, {
        method: "GET",
        signal: AbortSignal.timeout(8000),
      });
      const txt = await r.text();
      if (r.status === 404 && /not.?found/i.test(txt)) return false;
      return true;
    } catch {
      return null;
    }
  };

  const notDeployedResult = (fn: string) => ({
    ok: false,
    title: `✗ Function ${fn} is not deployed yet`,
    body:
      `The Supabase gateway returns 404 NOT_FOUND for ${fn}.\n\n` +
      `Deploy it with the Supabase CLI:\n` +
      `  supabase functions deploy ${fn}\n\n` +
      `(Needs the SUPABASE_SERVICE_ROLE_KEY secret and, for api-seal, the companies table with your key.)`,
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
      const { PDFDocument, StandardFonts } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      const page = doc.addPage([300, 200]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      page.drawText(`TRAMPTO API test ${new Date().toISOString()}`, {
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
          filename: "api-test.pdf",
          format: "pdf",
        }),
        signal: AbortSignal.timeout(15000),
      });
      const text = await res.text();
      setResult({
        ok: res.ok,
        title: res.ok
          ? `✓ api-seal responded ${res.status}: the key works`
          : `✗ api-seal responded ${res.status}`,
        body: text.slice(0, 600),
      });
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      setResult(
        /failed to fetch|networkerror/i.test(m)
          ? notDeployedResult("api-seal")
          : {
              ok: false,
              title: "✗ Could not connect to api-seal",
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
          ? `✓ api-verify responded ${res.status}: the public endpoint works`
          : `✗ api-verify responded ${res.status}`,
        body: text.slice(0, 600),
      });
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      setResult(
        /failed to fetch|networkerror/i.test(m)
          ? notDeployedResult("api-verify")
          : {
              ok: false,
              title: "✗ Could not connect to api-verify",
              body: m,
            }
      );
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="admin-panel">
      <h3>{t("api.adminPanelTitle")}</h3>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
        {t("api.adminPanelSub")}
      </p>
      <div className="form" style={{ marginBottom: 12 }}>
        <label htmlFor="admin-key">{t("api.keyToTest")}</label>
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
              <CheckIcon size={15} /> {t("api.testSeal")}
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
              <CheckIcon size={15} /> {t("api.testVerify")}
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
