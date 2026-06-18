import { useEffect, useState } from "react";
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Vista del enlace público de verificación: /v/{huella-sha256}
const PublicVerify = ({ ctx, hash: rawHash }: { ctx: AppCtx; hash: string }) => {
  const { navigate } = ctx;
  // Limpia comillas/espacios/barras pegados al copiar el enlace
  const hash = normalizeHash(rawHash);
  const [status, setStatus] = useState<
    "loading" | "valid" | "not_found" | "error"
  >("loading");
  const [record, setRecord] = useState<VerifyResult | null>(null);
  const [attempt, setAttempt] = useState(0);

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
          Verificando documento…
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
          <h2>No se pudo comprobar</h2>
          <p className="sub">
            No hay conexión con el registro de TRAMPTO en este momento. El
            sello no se ha podido confirmar ni descartar.
          </p>
        </div>
        <div className="center mt-16">
          <button
            className="btn btn-primary"
            onClick={() => setAttempt((a) => a + 1)}
          >
            Reintentar
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
          <h2>Documento no encontrado</h2>
          <p className="sub">
            Este documento no ha sido sellado con TRAMPTO o el enlace de
            verificación no es válido.
          </p>
        </div>
        <div className="center mt-16">
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Verificar un documento
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
        <h2>Documento verificado</h2>
        <p className="sub">
          Auténtico y sin modificaciones desde su sellado. El Seal ID y la
          fecha acreditan quién lo selló y cuándo.
        </p>
      </div>

      <div className="fields">
        {record?.filename && (
          <Field label="Documento" value={record.filename} />
        )}
        {record?.createdAt && (
          <Field label="Sellado el" value={formatDate(record.createdAt)} />
        )}
        <Field label="Huella SHA-256 (privada)" value={hash} sensitive />
        <Field
          label="Enlace público de verificación"
          value={verificationUrl(hash)}
          copyValue={verificationUrl(hash)}
        />
      </div>

      <div className="actions">
        <ShareMenu
          url={verificationUrl(hash)}
          text={`Verifica "${record?.filename ?? "este documento"}" sellado con TRAMPTO`}
          label="Compartir verificación"
        />
        <button className="btn btn-outline" onClick={() => navigate("/")}>
          Sella tu propio documento
        </button>
      </div>

      <div className="unique-message">
        <p>
          A partir de este hash,{" "}
          <strong>este documento es único en internet</strong>. No existen dos
          iguales.
        </p>
      </div>
    </div>
  );
};

export default PublicVerify;
