import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  hasInstallPrompt,
  isIOS,
  isStandalone,
  onInstallChange,
  promptInstall,
  MICROSOFT_STORE_URL,
} from "../lib/pwaInstall";
import { DownloadIcon, ShareIcon, XIcon } from "./Icons";

// Botón "Instalar Trampto" con comportamiento según dispositivo:
// - Chrome/Edge/Android con beforeinstallprompt → lanza el prompt nativo.
// - iOS/Safari (sin prompt) → modal con instrucciones "Añadir a inicio".
// - Si ya está instalada (standalone) → no se muestra.
// - MICROSOFT_STORE_URL (si se rellena) → enlace a la ficha de la Store.
const InstallButton = ({ short = false }: { short?: boolean }) => {
  const { t } = useTranslation();
  const [promptReady, setPromptReady] = useState(hasInstallPrompt());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => onInstallChange(() => setPromptReady(hasInstallPrompt())), []);

  // Ya instalada → nada que mostrar
  if (isStandalone()) return null;

  const ios = isIOS();
  // Mostrar el botón solo si hay forma real de instalar
  if (!promptReady && !ios && !MICROSOFT_STORE_URL) return null;

  const handleClick = async () => {
    if (promptReady) {
      await promptInstall();
      return;
    }
    if (MICROSOFT_STORE_URL) {
      window.open(MICROSOFT_STORE_URL, "_blank", "noopener");
      return;
    }
    // iOS/Safari → instrucciones
    setShowModal(true);
  };

  return (
    <>
      <button className="install-btn" onClick={handleClick}>
        <DownloadIcon size={16} />
        {short ? t("install.buttonShort") : t("install.button")}
      </button>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
              aria-label={t("install.close")}
            >
              <XIcon size={20} />
            </button>
            <h2>{t("install.iosTitle")}</h2>
            <p className="modal-sub">{t("install.iosIntro")}</p>
            <ol className="ios-steps">
              <li>
                <ShareIcon size={16} /> {t("install.iosStep1")}
              </li>
              <li>{t("install.iosStep2")}</li>
              <li>{t("install.iosStep3")}</li>
            </ol>
            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 8 }}
              onClick={() => setShowModal(false)}
            >
              {t("install.close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallButton;
