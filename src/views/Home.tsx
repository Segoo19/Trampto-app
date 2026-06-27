import { useState } from "react";
import type { AppCtx } from "../App";
import {
  sealPdf,
  registerSeal,
  verifyPdf,
  generateCertificate,
  downloadBytes,
  sealedFilename,
  certificateFilename,
  verificationUrl,
  type SealResult,
  type VerifyResult,
} from "../lib/seal";
import { toPdf, detectKind, SEAL_ACCEPT, LEGACY_OFFICE_RE } from "../lib/convert";
import { incrementFreeUsedOnDevice, FREE_LIMIT } from "../lib/usage";
import { Dropzone, Field } from "../components/Bits";
import ShareMenu from "../components/ShareMenu";
import {
  ShieldCheckIcon,
  ShieldAlertIcon,
  CheckIcon,
  DownloadIcon,
  CrownIcon,
  LockIcon,
  FileIcon,
  ExternalIcon,
} from "../components/Icons";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB, igual que la web

const LEGACY_MSG =
  "Ese es un formato de Office antiguo (.ppt/.doc). Ábrelo en PowerPoint o Word y usa «Guardar como» → .pptx, .docx o PDF.";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const Home = ({
  ctx,
  initialMode = "seal",
}: {
  ctx: AppCtx;
  initialMode?: "seal" | "verify";
}) => {
  const { usage, refreshUsage, navigate } = ctx;

  const [mode, setMode] = useState<"seal" | "verify">(initialMode);
  const [error, setError] = useState<string | null>(null);

  // Sellado
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [steps, setSteps] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<SealResult | null>(null);
  const [registered, setRegistered] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Verificación
  const [verifyPhase, setVerifyPhase] = useState<"idle" | "working" | "done">(
    "idle"
  );
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

  const handleSeal = async (file: File) => {
    setError(null);
    if (!usage) return;
    if (usage.blocked) {
      navigate("/payment");
      return;
    }
    if (LEGACY_OFFICE_RE.test(file.name)) {
      setError(LEGACY_MSG);
      return;
    }
    const kind = detectKind(file);
    if (!kind) {
      setError(
        "Formato no soportado. Sube un PDF, Word (DOCX), PowerPoint (PPTX), imagen o TXT."
      );
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("El documento debe pesar menos de 50 MB.");
      return;
    }

    const needsConvert = kind !== "pdf";
    const stepsList = [
      ...(needsConvert ? ["Convirtiendo a PDF"] : []),
      "Calculando la huella SHA-256",
      "Sellando página a página",
      "Registrando el sello público",
    ];
    const offset = needsConvert ? 1 : 0;
    setSteps(stepsList);
    setPhase("working");
    setStep(0);

    try {
      const converted = await toPdf(file);
      if (needsConvert) setStep(1);

      const sealed = await sealPdf(converted.bytes, converted.filename, (s) =>
        setStep(s + offset)
      );
      setStep(offset + 2);
      const reg = await registerSeal(sealed);
      if (reg.ok) incrementFreeUsedOnDevice();
      downloadBytes(sealed.sealedBytes, sealedFilename(sealed.filename));
      setResult(sealed);
      setRegistered(reg.ok);
      setRegisterError(reg.ok ? null : reg.error ?? null);
      setPhase("done");
      refreshUsage();
    } catch (err) {
      console.error("seal error:", err);
      const message = err instanceof Error ? err.message : "";
      let friendly =
        "No se pudo sellar el documento. Comprueba que el fichero no esté dañado.";
      if (/OFFICE_LEGACY|central directory|zip/i.test(message)) {
        friendly = LEGACY_MSG;
      } else if (/encrypt/i.test(message)) {
        friendly =
          "Este PDF está protegido con contraseña. Quita la protección e inténtalo de nuevo.";
      }
      setError(friendly);
      setPhase("idle");
    }
  };

  const handleVerify = async (file: File) => {
    setError(null);
    if (detectKind(file) !== "pdf") {
      setError("La verificación se hace con el PDF sellado que descargaste.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("El documento debe pesar menos de 50 MB.");
      return;
    }
    setVerifyPhase("working");
    try {
      setVerifyResult(await verifyPdf(file));
    } catch (err) {
      console.error("verify error:", err);
      setVerifyResult(null);
      setError("No se pudo verificar el documento. Inténtalo de nuevo.");
      setVerifyPhase("idle");
      return;
    }
    setVerifyPhase("done");
  };

  const retryRegister = async () => {
    if (!result) return;
    setRetrying(true);
    const reg = await registerSeal(result);
    if (reg.ok) {
      incrementFreeUsedOnDevice();
      setRegistered(true);
      setRegisterError(null);
      refreshUsage();
    } else {
      setRegisterError(reg.error ?? null);
    }
    setRetrying(false);
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setRegistered(false);
    setRegisterError(null);
    setError(null);
    setVerifyPhase("idle");
    setVerifyResult(null);
  };

  const switchMode = (m: "seal" | "verify") => {
    setMode(m);
    reset();
  };

  return (
    <>
      <div className="hero">
        <h1>
          Tu documento, <em>único</em> e inalterable
        </h1>
        <p>
          Garantizamos que su contenido no se altera y dejamos constancia de
          <strong> quién lo selló y cuándo</strong>: huella SHA-256, Seal ID
          único, fecha y enlace público de verificación.
        </p>
      </div>

      <div className="segmented-wrap">
        <div className="segmented" role="tablist">
          <button
            className={mode === "seal" ? "active" : ""}
            onClick={() => switchMode("seal")}
            role="tab"
            aria-selected={mode === "seal"}
          >
            Sellar
          </button>
          <button
            className={mode === "verify" ? "active" : ""}
            onClick={() => switchMode("verify")}
            role="tab"
            aria-selected={mode === "verify"}
          >
            Verificar
          </button>
        </div>
      </div>

      {/* ---------- SELLAR ---------- */}
      {mode === "seal" && phase === "idle" && (
        <>
          {usage?.blocked ? (
            <div className="card paywall">
              <div className="crown">
                <CrownIcon size={28} />
              </div>
              <h2>Has usado tus {FREE_LIMIT} documentos gratis</h2>
              <p style={{ color: "var(--muted)", fontSize: 14.5 }}>
                Pásate a Pro y sella documentos sin límite.
              </p>
              <div className="price">
                1,99 € <span>/ mes</span>
              </div>
              <button
                className="btn btn-gold btn-lg"
                onClick={() => navigate("/payment")}
              >
                <CrownIcon size={18} /> Hazte Pro
              </button>
              <p className="stripe-note">Pago seguro con Stripe</p>
            </div>
          ) : (
            <Dropzone
              title="Arrastra tu documento aquí"
              subtitle="PDF, Word, PowerPoint, imágenes o TXT · máx. 50 MB"
              accept={SEAL_ACCEPT}
              disabled={!usage}
              onFile={handleSeal}
            />
          )}
          {error && (
            <div className="notice notice-error mt-16">
              <ShieldAlertIcon size={18} />
              {error}
            </div>
          )}
        </>
      )}

      {mode === "seal" && phase === "working" && (
        <div className="card">
          <ul className="steps">
            {steps.map((label, i) => (
              <li
                key={label}
                className={i < step ? "done" : i === step ? "current" : ""}
              >
                <span className="step-dot">
                  {i < step ? (
                    <CheckIcon size={14} />
                  ) : i === step ? (
                    <span className="spinner" />
                  ) : (
                    i + 1
                  )}
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {mode === "seal" && phase === "done" && result && (
        <div className="card">
          <div className="result-head">
            <div className="result-badge">
              <ShieldCheckIcon size={32} />
            </div>
            <h2>Documento sellado</h2>
            <p className="sub mt-8">
              <span className="file-chip">
                <FileIcon size={15} />
                <span>{result.filename}</span>
              </span>
            </p>
          </div>

          {!registered && (
            <div className="notice notice-warn">
              <ShieldAlertIcon size={18} />
              <span>
                El documento se ha sellado y descargado, pero no se pudo
                registrar el sello para la verificación pública. Comprueba tu
                conexión e inténtalo de nuevo.
                {registerError && (
                  <>
                    <br />
                    <small style={{ opacity: 0.85 }}>Motivo: {registerError}</small>
                  </>
                )}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={retryRegister}
                disabled={retrying}
              >
                {retrying ? <span className="spinner spinner-dark" /> : "Reintentar"}
              </button>
            </div>
          )}

          <div className="fields">
            <Field
              label="ID de sello"
              value={`TRP-${result.sealId}`}
              copyValue={`TRP-${result.sealId}`}
            />
            <Field
              label="Huella SHA-256 (privada)"
              value={result.stampedHash}
              sensitive
            />
          </div>
          <div className="hash-caution">
            <LockIcon size={15} />
            <span>
              <strong>Cuidado:</strong> la huella identifica tu documento de
              forma única. No la copies ni la compartas sueltas: comparte
              solo el <strong>enlace público de verificación</strong>.
            </span>
          </div>

          {registered && (
            <div className="fields">
              <Field
                label="Enlace público de verificación"
                value={verificationUrl(result.stampedHash)}
                copyValue={verificationUrl(result.stampedHash)}
              />
            </div>
          )}

          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={() =>
                downloadBytes(result.sealedBytes, sealedFilename(result.filename))
              }
            >
              <DownloadIcon size={17} /> PDF sellado
            </button>
            <button
              className="btn btn-burgundy"
              onClick={async () =>
                downloadBytes(
                  await generateCertificate(result),
                  certificateFilename(result.filename)
                )
              }
            >
              <DownloadIcon size={17} /> Certificado de integridad
            </button>
            {registered && (
              <>
                <ShareMenu
                  url={verificationUrl(result.stampedHash)}
                  text={`Verifica "${result.filename}" sellado con TRAMPTO`}
                  label="Compartir"
                />
                <a
                  className="btn btn-outline"
                  href={verificationUrl(result.stampedHash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalIcon size={16} /> Link público
                </a>
              </>
            )}
          </div>

          <div className="unique-message">
            <p>
              A partir de este hash, <strong>tu documento es único en internet</strong>.
              No existen dos iguales.
            </p>
          </div>

          <div className="center mt-16">
            <button className="btn btn-ghost" onClick={reset}>
              Sellar otro documento
            </button>
          </div>
        </div>
      )}

      {/* ---------- VERIFICAR ---------- */}
      {mode === "verify" && verifyPhase === "idle" && (
        <>
          <Dropzone
            title="Arrastra el PDF sellado"
            subtitle="comprobaremos su integridad contra el registro de TRAMPTO"
            accept=".pdf,application/pdf"
            onFile={handleVerify}
          />
          {error && (
            <div className="notice notice-error mt-16">
              <ShieldAlertIcon size={18} />
              {error}
            </div>
          )}
        </>
      )}

      {mode === "verify" && verifyPhase === "working" && (
        <div className="card center">
          <span
            className="spinner spinner-dark"
            style={{ width: 22, height: 22, display: "inline-block" }}
          />
          <p className="mt-16" style={{ color: "var(--muted)" }}>
            Verificando documento…
          </p>
        </div>
      )}

      {mode === "verify" && verifyPhase === "done" && verifyResult && (
        <div className="card">
          {verifyResult.valid ? (
            <>
              <div className="result-head">
                <div className="result-badge">
                  <ShieldCheckIcon size={32} />
                </div>
                <h2>Documento auténtico</h2>
                <p className="sub">
                  No ha sido modificado desde su sellado. El Seal ID y la fecha
                  acreditan quién lo selló y cuándo.
                </p>
              </div>
              <div className="fields">
                {verifyResult.filename && (
                  <Field label="Documento" value={verifyResult.filename} />
                )}
                {verifyResult.createdAt && (
                  <Field
                    label="Sellado el"
                    value={formatDate(verifyResult.createdAt)}
                  />
                )}
                {verifyResult.sealId && (
                  <Field
                    label="ID de sello"
                    value={`TRP-${verifyResult.sealId}`}
                    copyValue={`TRP-${verifyResult.sealId}`}
                  />
                )}
                <Field
                  label="Enlace público de verificación"
                  value={verificationUrl(verifyResult.hash)}
                  copyValue={verificationUrl(verifyResult.hash)}
                />
              </div>
              <div className="actions">
                <ShareMenu
                  url={verificationUrl(verifyResult.hash)}
                  text={`Verifica "${verifyResult.filename ?? "este documento"}" sellado con TRAMPTO`}
                  label="Compartir verificación"
                />
                <a
                  className="btn btn-outline"
                  href={verificationUrl(verifyResult.hash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalIcon size={16} /> Link público
                </a>
              </div>
            </>
          ) : (
            <div className="result-head">
              <div className="result-badge invalid">
                <ShieldAlertIcon size={32} />
              </div>
              <h2>Sello no válido</h2>
              <p className="sub">
                Este documento no ha sido sellado con TRAMPTO o fue modificado
                después del sellado.
              </p>
            </div>
          )}
          <div className="center mt-16">
            <button className="btn btn-ghost" onClick={reset}>
              Verificar otro documento
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
