import { MailIcon } from "./Icons";

// Footer multicolumna como el de la web, en versión minimalista
const Footer = ({ navigate }: { navigate: (to: string) => void }) => {
  const go = (to: string) => () => navigate(to);

  return (
    <footer className="bigfooter">
      <div className="bigfooter-inner">
        <div className="bigfooter-grid">
          <div className="bigfooter-brand">
            <img src="/trampto-logo.png" alt="TRAMPTO" />
            <div>
              <h4>TRAMPTO</h4>
              <p>
                Integridad documental con huella SHA-256. Tu documento, único e
                inalterable.
              </p>
            </div>
          </div>

          <div>
            <h5>Producto</h5>
            <ul>
              <li>
                <button className="linklike" onClick={go("/")}>
                  Sellar documento
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/")}>
                  Verificar documento
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/payment")}>
                  Precios
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/api-key")}>
                  API para empresas
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5>Recursos</h5>
            <ul>
              <li>
                <button className="linklike" onClick={go("/use-cases")}>
                  Casos de uso
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/blog")}>
                  Blog
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/about")}>
                  Sobre TRAMPTO
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5>Cuenta</h5>
            <ul>
              <li>
                <button className="linklike" onClick={go("/perfil")}>
                  Iniciar sesión
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/perfil")}>
                  Mi perfil
                </button>
              </li>
              <li>
                <button className="linklike" onClick={go("/privacidad")}>
                  Privacidad
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="bigfooter-bottom">
          <span>© {new Date().getFullYear()} TRAMPTO. Todos los derechos reservados.</span>
          <a href="mailto:tramptooficial@gmail.com">
            <MailIcon size={13} className="inline-icon" /> tramptooficial@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
