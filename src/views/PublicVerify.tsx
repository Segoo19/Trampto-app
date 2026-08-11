import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppCtx } from "../App";
import {
  lookupHash,
  normalizeHash,
  sealedDocumentUrl,
  sealedDocumentExists,
  type VerifyResult,
} from "../lib/seal";
import { Field } from "../components/Bits";
import {
  DownloadIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "../components/Icons";

// Vista del enlace público de verificación: /v/{huella-sha256}
const PublicVerify = ({ ctx, hash: rawHash }: { ctx: AppCtx; hash: string }) => {
  const { t, i18n } = useTranslation();
  const { navigate } = ctx;
  // Limpia comillas/espacios/barras pegados al copiar el enlace
  const hash = normalizeHash(rawHash);
  const [status, setStatus] = useState<
    "loading" | "valid" | "not_found" | "error"
  >("loading");
  const [record, setRecord] = useState<VerifyResult | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

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

  useEffect(() => {
    if (!hash) {
      setStatus("not_found");
      return;
    }
    setStatus("loading");
    setDocUrl(null);
    lookupHash(hash)
      .then((found) => {
        if (found) {
          setRecord(found);
          setStatus("valid");
          // ¿Está guardado el documento? Si sí, el receptor podrá verlo/descargarlo.
          sealedDocumentExists(hash).then((ok) =>
            setDocUrl(ok ? sealedDocumentUrl(hash) : null)
          );
        } else {
          setStatus("not_found");
        }
      })
      .catch(() => setStatus("error"));
  }, [hash, attempt]);

  if (status === "loading") {
    return (
      <div className="card center">
        <span
          className="spinner spinner-dark"
          style={{ width: 22, height: 22, display: "inline-block" }}
        />
        <p className="mt-16" style={{ color: "var(--muted)" }}>
          {t("publicVerify.loading")}
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="card">
        <div className="result-head">
          <div className="result-badge invalid">
            <ShieldAlertIcon size={32} />
          </div>
          <h2>{t("publicVerify.errorTitle")}</h2>
          <p className="sub">{t("publicVerify.errorSub")}</p>
        </div>
        <div className="center mt-16">
          <button
            className="btn btn-primary"
            onClick={() => setAttempt((a) => a + 1)}
          >
            {t("publicVerify.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="card">
        <div className="result-head">
          <div className="result-badge invalid">
            <ShieldAlertIcon size={32} />
          </div>
          <h2>{t("publicVerify.notFoundTitle")}</h2>
          <p className="sub">{t("publicVerify.notFoundSub")}</p>
        </div>
        <div className="center mt-16">
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            {t("publicVerify.verifyADoc")}
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
        <h2>{t("publicVerify.verifiedTitle")}</h2>
        <p className="sub">{t("publicVerify.verifiedSub")}</p>
      </div>

      {/* Mensaje introductorio, claro y en el idioma del usuario: explica al
          receptor qué está viendo, sin tecnicismos. */}
      <div className="verify-intro">
        <p>{t("publicVerify.intro")}</p>
      </div>

      {/* Vista del RECEPTOR: datos estrictos (nombre + fecha de sellado). No se
          muestra la huella, ni el enlace, ni nada del propietario, ni el botón
          de compartir, para no exponer datos privados ni fomentar la
          redistribución. La vista completa (huella, enlace, compartir) es la del
          propietario, en la pantalla de sellado (Home). */}
      <div className="fields">
        {record?.filename && (
          <Field label={t("verify.labelDocument")} value={record.filename} />
        )}
        {record?.createdAt && (
          <Field label={t("verify.labelSealedOn")} value={formatDate(record.createdAt)} />
        )}
      </div>

      {/* Documento sellado: vista previa + descarga (si está guardado). El
          receptor puede verlo y descargarlo, pero no compartir ni ver datos
          privados. */}
      {docUrl && (
        <div className="doc-preview">
          <iframe
            src={`${docUrl}#toolbar=0`}
            title={record?.filename ?? t("verify.labelDocument")}
          />
          <a
            className="btn btn-primary"
            href={docUrl}
            target="_blank"
            rel="noreferrer"
          >
            <DownloadIcon size={17} /> {t("publicVerify.downloadDocument")}
          </a>
        </div>
      )}

      <div className="center mt-16">
        <button className="btn btn-outline" onClick={() => navigate("/")}>
          {t("publicVerify.sealYourOwn")}
        </button>
      </div>

      <div className="unique-message">
        <p>
          {t("seal.uniquePre")}
          <strong>{t("publicVerify.uniqueStrong")}</strong>
          {t("seal.uniquePost")}
        </p>
      </div>
    </div>
  );
};

export default PublicVerify;
