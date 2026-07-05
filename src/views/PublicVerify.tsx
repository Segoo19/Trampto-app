import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppCtx } from "../App";
import {
  lookupHash,
  normalizeHash,
  verificationUrl,
  type VerifyResult,
} from "../lib/seal";
import { Field } from "../components/Bits";
import ShareMenu from "../components/ShareMenu";
import { ShieldAlertIcon, ShieldCheckIcon } from "../components/Icons";

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
    lookupHash(hash)
      .then((found) => {
        if (found) {
          setRecord(found);
          setStatus("valid");
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

      <div className="fields">
        {record?.filename && (
          <Field label={t("verify.labelDocument")} value={record.filename} />
        )}
        {record?.createdAt && (
          <Field label={t("verify.labelSealedOn")} value={formatDate(record.createdAt)} />
        )}
        <Field label={t("seal.labelFingerprint")} value={hash} sensitive />
        <Field
          label={t("seal.labelPublicLink")}
          value={verificationUrl(hash)}
          copyValue={verificationUrl(hash)}
        />
      </div>

      <div className="actions">
        <ShareMenu
          url={verificationUrl(hash)}
          text={t("share.fileText", {
            name: record?.filename ?? t("share.fileFallback"),
          })}
          label={t("verify.shareVerification")}
        />
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
