import { useState } from "react";
import { useTranslation } from "react-i18next";

// Consentimiento de privacidad en el PRIMER arranque (regla 7.5 de Huawei):
// antes de usar la app o registrarse hay que informar de la política de privacidad
// y obtener el consentimiento. Se muestra una sola vez; la elección se guarda en
// localStorage. El enlace apunta a la versión ESTÁTICA (/privacidad.html), que
// carga siempre aunque el router aún no esté listo.
const KEY = "trampto_privacy_consent";

function alreadyAccepted(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

const ConsentGate = () => {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(alreadyAccepted());
  if (accepted) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* modo privado: seguimos sin persistir */
    }
    setAccepted(true);
  };

  return (
    <div
      className="consent-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <div className="consent-card">
        <h2 id="consent-title">{t("consent.title")}</h2>
        <p>{t("consent.body")}</p>
        <p className="consent-links">
          <a href="/privacidad.html" target="_blank" rel="noreferrer">
            {t("consent.privacyLink")}
          </a>
        </p>
        <button className="btn btn-primary btn-lg" onClick={accept}>
          {t("consent.accept")}
        </button>
      </div>
    </div>
  );
};

export default ConsentGate;
