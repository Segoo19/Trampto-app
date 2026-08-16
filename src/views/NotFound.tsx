import { useTranslation } from "react-i18next";

// Página 404 para rutas que no existen (antes cualquier ruta desconocida
// mostraba la home). Mejora la UX y evita que Google indexe "home" bajo URLs
// erróneas.
const NotFound = ({ navigate }: { navigate: (to: string) => void }) => {
  const { t } = useTranslation();
  return (
    <div className="card center notfound">
      <div className="notfound-code">404</div>
      <h2>{t("notFound.title")}</h2>
      <p className="sub">{t("notFound.text")}</p>
      <button className="btn btn-primary mt-16" onClick={() => navigate("/")}>
        {t("notFound.cta")}
      </button>
    </div>
  );
};

export default NotFound;
