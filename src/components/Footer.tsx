import type React from "react";
import { useTranslation } from "react-i18next";
import { MailIcon } from "./Icons";

// Footer multicolumna como el de la web, en versión minimalista
const Footer = ({ navigate }: { navigate: (to: string) => void }) => {
  const { t } = useTranslation();
  // Enlaces <a href> reales para que buscadores y crawlers de IA sigan la
  // navegación; el clic normal sigue usando el router SPA.
  const go = (to: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(to);
  };

  return (
    <footer className="bigfooter">
      <div className="bigfooter-inner">
        <div className="bigfooter-grid">
          <div className="bigfooter-brand">
            <img src="/trampto-logo.png" alt="TRAMPTO" />
            <div>
              <h4>TRAMPTO</h4>
              <p>{t("footer.tagline")}</p>
            </div>
          </div>

          <div>
            <h5>{t("footer.product")}</h5>
            <ul>
              <li>
                <a className="linklike" href="/" onClick={go("/")}>
                  {t("footer.sealDocument")}
                </a>
              </li>
              <li>
                <a className="linklike" href="/verificar" onClick={go("/verificar")}>
                  {t("footer.verifyDocument")}
                </a>
              </li>
              <li>
                <a className="linklike" href="/payment" onClick={go("/payment")}>
                  {t("footer.pricing")}
                </a>
              </li>
              <li>
                <a className="linklike" href="/api-key" onClick={go("/api-key")}>
                  {t("drawer.apiForBusiness")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5>{t("footer.resources")}</h5>
            <ul>
              <li>
                <a className="linklike" href="/use-cases" onClick={go("/use-cases")}>
                  {t("drawer.useCases")}
                </a>
              </li>
              <li>
                <a className="linklike" href="/blog" onClick={go("/blog")}>
                  {t("drawer.blog")}
                </a>
              </li>
              <li>
                <a className="linklike" href="/about" onClick={go("/about")}>
                  {t("drawer.about")}
                </a>
              </li>
              <li>
                <a className="linklike" href="/comparativa" onClick={go("/comparativa")}>
                  {t("info.compare.title")}
                </a>
              </li>
              <li>
                <a className="linklike" href="/glosario" onClick={go("/glosario")}>
                  {t("info.glossary.title")}
                </a>
              </li>
              <li>
                <a className="linklike" href="/faq" onClick={go("/faq")}>
                  {t("faq.menu")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5>{t("footer.account")}</h5>
            <ul>
              <li>
                <a className="linklike" href="/perfil" onClick={go("/perfil")}>
                  {t("header.signIn")}
                </a>
              </li>
              <li>
                <a className="linklike" href="/perfil" onClick={go("/perfil")}>
                  {t("footer.myProfile")}
                </a>
              </li>
              <li>
                <a
                  className="linklike"
                  href="/privacidad.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("footer.privacy")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="bigfooter-bottom">
          <span>© {new Date().getFullYear()} TRAMPTO. {t("footer.rights")}</span>
          <a href="mailto:tramptooficial@gmail.com">
            <MailIcon size={13} className="inline-icon" /> tramptooficial@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
