import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  sha256Hex,
  lookupHash,
  sealPdf,
  registerSeal,
  verificationUrl,
  type VerifyResult,
} from "../lib/seal";
import { apiBaseUrl } from "../lib/usage";
import { toPdf, detectKind, SEAL_ACCEPT, LEGACY_OFFICE_RE } from "../lib/convert";
import {
  ShieldCheckIcon,
  ShieldAlertIcon,
  UploadIcon,
  ExternalIcon,
} from "./Icons";

const PDF_ONLY = ".pdf,application/pdf";

// Demo (visible para cualquiera, también empresas no suscriptoras) de cómo se
// vería TRAMPTO integrado vía API key en la web de una empresa cliente. Es una
// maqueta de un sitio externo ("Gestoría Atlas") con un widget TRAMPTO real,
// con dos pestañas: Verificar y Sellar.

const DEMO_KEY = "trp_DEMOxxxxxxxxxxxxxxxxxxxxxxxx";

async function verifyForDemo(
  file: File
): Promise<{ via: "api" | "registro"; result: VerifyResult }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const hash = await sha256Hex(bytes);
  try {
    const res = await fetch(`${apiBaseUrl()}/api-verify/${hash}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        via: "api",
        result: data.valid
          ? {
              valid: true,
              hash,
              filename: data.filename,
              createdAt: data.sealedAt,
              sealId: data.sealId,
            }
          : { valid: false, hash },
      };
    }
  } catch {
    /* función api-verify no desplegada o sin red: usamos el registro */
  }
  const record = await lookupHash(hash);
  return { via: "registro", result: record ?? { valid: false, hash } };
}

const CompanyDemo = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"seal" | "verify">("verify");

  return (
    <div className="demo-wrap">
      <p className="demo-caption">{t("demo.caption")}</p>

      <div className="demo-browser">
        <div className="demo-bar">
          <span className="demo-dot" />
          <span className="demo-dot" />
          <span className="demo-dot" />
          <span className="demo-url">https://www.gestoria-atlas.es/documentos</span>
        </div>

        <div className="demo-site">
          <div className="demo-nav">
            <div className="demo-logo">
              <span className="demo-logo-mark">A</span> Gestoría Atlas
            </div>
            <nav className="demo-menu">
              <span>{t("demo.navServices")}</span>
              <span>{t("demo.navClients")}</span>
              <span className="demo-menu-active">{t("demo.navDocuments")}</span>
            </nav>
          </div>

          <div className="demo-hero">
            <h3>{t("demo.heroTitle")}</h3>
            <p>{t("demo.heroSub")}</p>
          </div>

          {/* Widget TRAMPTO embebido con pestañas */}
          <div className="demo-widget">
            <div className="demo-tabs">
              <button
                className={tab === "seal" ? "active" : ""}
                onClick={() => setTab("seal")}
              >
                {t("tabs.seal")}
              </button>
              <button
                className={tab === "verify" ? "active" : ""}
                onClick={() => setTab("verify")}
              >
                {t("tabs.verify")}
              </button>
            </div>

            {tab === "verify" ? <VerifyPane /> : <SealPane />}

            <div className="demo-powered">
              <span>
                {t("demo.poweredBy")} <strong>TRAMPTO</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <details className="demo-code">
        <summary>{t("demo.viewCode")}</summary>
        <pre className="codeblock">{`<!-- On your company's website -->
<script>
  const TRAMPTO_API_KEY = "${DEMO_KEY}";

  // Seal: POST /api-seal  ->  { hash, verifyUrl, sealId }
  async function seal(file) {
    const b64 = btoa(String.fromCharCode(...new Uint8Array(await file.arrayBuffer())));
    const r = await fetch("${apiBaseUrl()}/api-seal", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": TRAMPTO_API_KEY },
      body: JSON.stringify({ file: b64, filename: file.name, format: "pdf" }),
    });
    return r.json();
  }

  // Verify: GET /api-verify/{hash}  ->  { valid, filename, sealedAt }
  async function verify(hash) {
    const r = await fetch("${apiBaseUrl()}/api-verify/" + hash);
    return r.json();
  }
</script>`}</pre>
      </details>
    </div>
  );
};

// --- Pestaña Verificar ---
const VerifyPane = () => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [via, setVia] = useState<"api" | "registro" | null>(null);
  const [drag, setDrag] = useState(false);

  const run = async (file: File) => {
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") return;
    setPhase("working");
    setResult(null);
    try {
      const { via, result } = await verifyForDemo(file);
      setVia(via);
      setResult(result);
    } catch {
      setResult({ valid: false, hash: "" });
    }
    setPhase("done");
  };

  if (phase === "working") {
    return (
      <div className="demo-status">
        <span className="spinner spinner-dark" />
        <span>{t("demo.verifying")}</span>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <>
        <div className={`demo-result ${result.valid ? "ok" : "bad"}`}>
          {result.valid ? (
            <>
              <ShieldCheckIcon size={26} />
              <div>
                <strong>{t("demo.authentic")}</strong>
                <span>
                  {t("demo.authenticSub", {
                    name: result.filename ?? t("demo.fallbackName"),
                  })}
                </span>
              </div>
            </>
          ) : (
            <>
              <ShieldAlertIcon size={26} />
              <div>
                <strong>{t("demo.notVerified")}</strong>
                <span>{t("demo.notVerifiedSub")}</span>
              </div>
            </>
          )}
        </div>
        <div className="demo-subrow">
          {via && (
            <span className="demo-via">
              {via === "api" ? t("demo.viaApi") : t("demo.viaRegistry")}
            </span>
          )}
          <button
            className="demo-reset"
            onClick={() => {
              setPhase("idle");
              setResult(null);
            }}
          >
            {t("demo.tryAnother")}
          </button>
        </div>
      </>
    );
  }

  return (
    <DemoDrop
      drag={drag}
      setDrag={setDrag}
      onFile={run}
      accept={PDF_ONLY}
      label={t("demo.dropVerify")}
      inputId="demo-verify-input"
    />
  );
};

// --- Pestaña Sellar ---
const SealPane = () => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<{
    sealId: string;
    hash: string;
    verifyUrl: string;
  } | null>(null);

  const run = async (file: File) => {
    setErr(null);
    if (LEGACY_OFFICE_RE.test(file.name)) {
      setErr(t("demo.errLegacy"));
      return;
    }
    if (!detectKind(file)) {
      setErr(t("demo.errUnsupported"));
      return;
    }
    setPhase("working");
    try {
      const converted = await toPdf(file); // convierte si no es PDF
      const sealed = await sealPdf(converted.bytes, converted.filename);
      await registerSeal(sealed);
      setOut({
        sealId: `TRP-${sealed.sealId}`,
        hash: sealed.stampedHash,
        verifyUrl: verificationUrl(sealed.stampedHash),
      });
      setPhase("done");
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      setErr(/OFFICE_LEGACY|zip/i.test(m) ? t("demo.errReadFile") : t("demo.errSeal"));
      setPhase("idle");
    }
  };

  if (phase === "working") {
    return (
      <div className="demo-status">
        <span className="spinner spinner-dark" />
        <span>{t("demo.sealing")}</span>
      </div>
    );
  }

  if (phase === "done" && out) {
    return (
      <>
        <div className="demo-result ok">
          <ShieldCheckIcon size={26} />
          <div>
            <strong>{t("demo.sealed")}</strong>
            <span>{t("demo.sealedSub")}</span>
          </div>
        </div>
        <pre className="codeblock demo-json">{`{
  "success": true,
  "sealId": "${out.sealId}",
  "hash": "${out.hash.slice(0, 24)}…",
  "verifyUrl": "${out.verifyUrl}"
}`}</pre>
        <div className="demo-subrow">
          <a
            className="demo-open"
            href={out.verifyUrl}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalIcon size={13} /> {t("demo.openVerification")}
          </a>
          <button className="demo-reset" onClick={() => setPhase("idle")}>
            {t("demo.sealAnother")}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <DemoDrop
        drag={drag}
        setDrag={setDrag}
        onFile={run}
        accept={SEAL_ACCEPT}
        label={t("demo.dropSeal")}
        inputId="demo-seal-input"
      />
      {err && <p className="demo-err">{err}</p>}
    </>
  );
};

// --- Zona de subida reutilizable ---
const DemoDrop = ({
  drag,
  setDrag,
  onFile,
  accept,
  label,
  inputId,
}: {
  drag: boolean;
  setDrag: (v: boolean) => void;
  onFile: (f: File) => void;
  accept: string;
  label: string;
  inputId: string;
}) => (
  <div
    className={`demo-drop ${drag ? "drag" : ""}`}
    onDragOver={(e) => {
      e.preventDefault();
      setDrag(true);
    }}
    onDragLeave={() => setDrag(false)}
    onDrop={(e) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    }}
    onClick={() => document.getElementById(inputId)?.click()}
  >
    <input
      id={inputId}
      type="file"
      accept={accept}
      hidden
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onFile(f);
        e.target.value = "";
      }}
    />
    <UploadIcon size={22} />
    <span>{label}</span>
  </div>
);

export default CompanyDemo;
