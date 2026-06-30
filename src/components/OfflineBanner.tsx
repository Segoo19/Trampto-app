import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Aviso discreto cuando no hay conexión. La app sigue funcionando (el sellado
// es local); solo el registro/verificación públicos necesitan red. Esto da un
// "estado offline decente" en vez de dejar que el contenedor muestre un error.
const OfflineBanner = () => {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(
    typeof navigator !== "undefined" && !navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      {t("offline.banner")}
    </div>
  );
};

export default OfflineBanner;
