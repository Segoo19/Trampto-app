import { useState } from "react";
import { useTranslation } from "react-i18next";
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

const Home = ({
  ctx,
  initialMode = "seal",
}: {
  ctx: AppCtx;
  initialMode?: "seal" | "verify";
}) => {
  const { t, i18n } = useTranslation();
  const { usage, refreshUsage, navigate } = ctx;

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString(
      i18n.language.startsWith("en") ? "en-US" : "es-ES",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

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
      setError(t("errors.legacyOffice"));
      return;
    }
    const kind = detectKind(file);
    if (!kind) {
      setError(t("errors.unsupportedFormat"));
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(t("errors.tooBig"));
      return;
    }

    const needsConvert = kind !== "pdf";
    const stepsList = [
      ...(needsConvert ? [t("seal.stepConverting")] : []),
      t("seal.stepHashing"),
      t("seal.stepSealing"),
      t("seal.stepRegistering"),
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
      let friendly = t("errors.sealFailed");
      if (/OFFICE_LEGACY|central directory|zip/i.test(message)) {
        friendly = t("errors.legacyOffice");
      } else if (/encrypt/i.test(message)) {
        friendly = t("errors.pdfProtected");
      }
      setError(friendly);
      setPhase("idle");
    }
  };

  const handleVerify = async (file: File) => {
    setError(null);
    if (detectKind(file) !== "pdf") {
      setError(t("errors.verifyNeedsPdf"));
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(t("errors.tooBig"));
      return;
    }
    setVerifyPhase("working");
    try {
      setVerifyResult(await verifyPdf(file));
    } catch (err) {
      console.error("verify error:", err);
      setVerifyResult(null);
      setError(t("errors.verifyFailed"));
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
          {t("hero.titlePre")}
          <em>{t("hero.titleEm")}</em>
          {t("hero.titlePost")}
        </h1>
        <p>
          {t("hero.subPre")}
          <strong>{t("hero.subStrong")}</strong>
          {t("hero.subPost")}
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
            {t("tabs.seal")}
          </button>
          <button
            className={mode === "verify" ? "active" : ""}
            onClick={() => switchMode("verify")}
            role="tab"
            aria-selected={mode === "verify"}
          >
            {t("tabs.verify")}
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
              <h2>{t("paywall.title", { limit: FREE_LIMIT })}</h2>
              <p style={{ color: "var(--muted)", fontSize: 14.5 }}>
                {t("paywall.text")}
              </p>
              <div className="price">
                {t("paywall.price")} <span>{t("paywall.perMonth")}</span>
              </div>
              <button
                className="btn btn-gold btn-lg"
                onClick={() => navigate("/payment")}
              >
                <CrownIcon size={18} /> {t("paywall.cta")}
              </button>
              <p className="stripe-note">{t("paywall.stripeNote")}</p>
            </div>
          ) : (
            <Dropzone
              title={t("seal.dropTitle")}
              subtitle={t("seal.dropSubtitle")}
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
            <h2>{t("seal.doneTitle")}</h2>
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
                {t("seal.notRegistered")}
                {registerError && (
                  <>
                    <br />
                    <small style={{ opacity: 0.85 }}>
                      {t("seal.reason")} {registerError}
                    </small>
                  </>
                )}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={retryRegister}
                disabled={retrying}
              >
                {retrying ? (
                  <span className="spinner spinner-dark" />
                ) : (
                  t("seal.retry")
                )}
              </button>
            </div>
          )}

          <div className="fields">
            <Field
              label={t("seal.labelSealId")}
              value={`TRP-${result.sealId}`}
              copyValue={`TRP-${result.sealId}`}
            />
            <Field
              label={t("seal.labelFingerprint")}
              value={result.stampedHash}
              sensitive
            />
          </div>
          <div className="hash-caution">
            <LockIcon size={15} />
            <span>
              <strong>{t("seal.cautionLabel")}</strong> {t("seal.cautionText")}
            </span>
          </div>

          {registered && (
            <div className="fields">
              <Field
                label={t("seal.labelPublicLink")}
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
              <DownloadIcon size={17} /> {t("seal.btnSealedPdf")}
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
              <DownloadIcon size={17} /> {t("seal.btnCertificate")}
            </button>
            {registered && (
              <>
                <ShareMenu
                  url={verificationUrl(result.stampedHash)}
                  text={t("share.fileText", { name: result.filename })}
                  label={t("share.share")}
                />
                <a
                  className="btn btn-outline"
                  href={verificationUrl(result.stampedHash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalIcon size={16} /> {t("seal.openLink")}
                </a>
              </>
            )}
          </div>

          <div className="unique-message">
            <p>
              {t("seal.uniquePre")}
              <strong>{t("seal.uniqueStrong")}</strong>
              {t("seal.uniquePost")}
            </p>
          </div>

          <div className="center mt-16">
            <button className="btn btn-ghost" onClick={reset}>
              {t("seal.sealAnother")}
            </button>
          </div>
        </div>
      )}

      {/* ---------- VERIFICAR ---------- */}
      {mode === "verify" && verifyPhase === "idle" && (
        <>
          <Dropzone
            title={t("verify.dropTitle")}
            subtitle={t("verify.dropSubtitle")}
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
            {t("verify.working")}
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
                <h2>{t("verify.authenticTitle")}</h2>
                <p className="sub">{t("verify.authenticSub")}</p>
              </div>
              <div className="fields">
                {verifyResult.filename && (
                  <Field
                    label={t("verify.labelDocument")}
                    value={verifyResult.filename}
                  />
                )}
                {verifyResult.createdAt && (
                  <Field
                    label={t("verify.labelSealedOn")}
                    value={formatDate(verifyResult.createdAt)}
                  />
                )}
                {verifyResult.sealId && (
                  <Field
                    label={t("seal.labelSealId")}
                    value={`TRP-${verifyResult.sealId}`}
                    copyValue={`TRP-${verifyResult.sealId}`}
                  />
                )}
                <Field
                  label={t("seal.labelPublicLink")}
                  value={verificationUrl(verifyResult.hash)}
                  copyValue={verificationUrl(verifyResult.hash)}
                />
              </div>
              <div className="actions">
                <ShareMenu
                  url={verificationUrl(verifyResult.hash)}
                  text={t("share.fileText", {
                    name: verifyResult.filename ?? t("share.fileFallback"),
                  })}
                  label={t("verify.shareVerification")}
                />
                <a
                  className="btn btn-outline"
                  href={verificationUrl(verifyResult.hash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalIcon size={16} /> {t("seal.openLink")}
                </a>
              </div>
            </>
          ) : (
            <div className="result-head">
              <div className="result-badge invalid">
                <ShieldAlertIcon size={32} />
              </div>
              <h2>{t("verify.invalidTitle")}</h2>
              <p className="sub">{t("verify.invalidSub")}</p>
            </div>
          )}
          <div className="center mt-16">
            <button className="btn btn-ghost" onClick={reset}>
              {t("verify.verifyAnother")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
