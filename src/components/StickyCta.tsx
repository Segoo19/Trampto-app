import { useTranslation } from "react-i18next";
import { StampIcon } from "./Icons";

// CTA fija en móvil, solo en páginas de contenido (FAQ, About, Blog, Casos,
// Privacidad), para llevar a la acción principal: sellar. Oculta en escritorio.
const StickyCta = ({ navigate }: { navigate: (to: string) => void }) => {
  const { t } = useTranslation();
  return (
    <div className="sticky-cta">
      <button className="btn btn-gold" onClick={() => navigate("/")}>
        <StampIcon size={17} /> {t("footer.sealDocument")}
      </button>
    </div>
  );
};

export default StickyCta;
