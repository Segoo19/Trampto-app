import { useTranslation } from "react-i18next";
import { MailIcon } from "./Icons";

// Footer multicolumna como el de la web, en versión minimalista
const Footer = ({ navigate }: { navigate: (to: string) => void }) => {
  const { t } = useTranslation();
  const go = (to: string) => () => navigate(to);

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
                <button className="linklike" onClick={go("/")}>
                  {t("footer.sealDocument")}
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/verificar")}>
                  {t("footer.verifyDocument")}
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/payment")}>
                  {t("footer.pricing")}
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/api-key")}>
                  {t("drawer.apiForBusiness")}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5>{t("footer.resources")}</h5>
            <ul>
              <li>
                <button className="linklike" onClick={go("/use-cases")}>
                  {t("drawer.useCases")}
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/blog")}>
                  {t("drawer.blog")}
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/about")}>
                  {t("drawer.about")}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5>{t("footer.account")}</h5>
            <ul>
              <li>
                <button className="linklike" onClick={go("/perfil")}>
                  {t("header.signIn")}
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/perfil")}>
                  {t("footer.myProfile")}
                </button>
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
