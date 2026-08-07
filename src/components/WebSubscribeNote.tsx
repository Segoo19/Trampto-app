import { useTranslation } from "react-i18next";
import { KeyIcon } from "./Icons";

// Nota que sustituye al botón de pago CUANDO la web corre dentro de la app
// Android (Huawei/Play). Las tiendas Android no permiten cobrar con pasarela de
// terceros dentro de la app, así que aquí no hay botón de pago: se indica que la
// suscripción se gestiona desde la web. En el navegador normal NO se muestra;
// allí el pago con Stripe sigue funcionando igual (ver lib/appContext.ts).
const WebSubscribeNote = () => {
  const { t } = useTranslation();
  // Dominio real actual: dentro de la app es trampto-app.vercel.app; el día que
  // se sirva en trampto.com se actualiza solo, sin tocar el texto.
  const site =
    typeof window !== "undefined" ? window.location.host : "trampto-app.vercel.app";
  return (
    <div
      className="notice"
      style={{
        background: "var(--gold-soft)",
        border: "1px solid #e3d09a",
        color: "#8a6c14",
        textAlign: "left",
      }}
    >
      <KeyIcon size={18} />
      <span>{t("storeNotice.subscribeOnWeb", { site })}</span>
    </div>
  );
};

export default WebSubscribeNote;
