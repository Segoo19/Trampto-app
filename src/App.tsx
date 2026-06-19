import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { getUsage, type Usage, FREE_LIMIT } from "./lib/usage";
import { getLocalAdmin, clearLocalAdmin } from "./lib/localAdmin";
import type { AppSession } from "./types";
import { usePath } from "./router";
import Home from "./views/Home";
import PublicVerify from "./views/PublicVerify";
import Payment from "./views/Payment";
import PaymentSuccess from "./views/PaymentSuccess";
import ApiKey from "./views/ApiKey";
import Profile from "./views/Profile";
import Info from "./views/Info";
import Footer from "./components/Footer";
import Drawer from "./components/Drawer";
import { CrownIcon, MenuIcon, UserIcon } from "./components/Icons";

export interface AppCtx {
  session: AppSession | null;
  usage: Usage | null;
  refreshUsage: () => Promise<void>;
  navigate: (to: string) => void;
}

const App = () => {
  const [path, navigate] = usePath();
  const [realSession, setRealSession] = useState<Session | null>(null);
  const [localAdmin, setLocalAdmin] = useState<AppSession | null>(getLocalAdmin());
  const [sessionReady, setSessionReady] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Sesión efectiva: la real de Supabase tiene prioridad; si no, la admin local
  const session: AppSession | null = (realSession as AppSession | null) ?? localAdmin;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setRealSession(session);
      setSessionReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setRealSession(session);
      setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Sincronizar el acceso admin local (otra pestaña o el formulario de login)
  useEffect(() => {
    const sync = () => setLocalAdmin(getLocalAdmin());
    window.addEventListener("trampto-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("trampto-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const refreshUsage = useCallback(async () => {
    const {
      data: { session: current },
    } = await supabase.auth.getSession();
    setUsage(await getUsage((current as AppSession | null) ?? getLocalAdmin()));
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    getUsage(session).then(setUsage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realSession, localAdmin, sessionReady]);

  const logout = async () => {
    clearLocalAdmin();
    setRealSession(null);
    navigate("/");
    // Cierre de sesión en Supabase en segundo plano (no bloquea la UI)
    supabase.auth.signOut().catch(() => {});
  };

  const ctx: AppCtx = { session, usage, refreshUsage, navigate };

  const lower = path.toLowerCase();
  let view;
  if (lower.startsWith("/v/")) {
    view = <PublicVerify ctx={ctx} hash={decodeURIComponent(path.slice(3))} />;
  } else if (lower === "/payment") {
    view = <Payment ctx={ctx} />;
  } else if (lower === "/payment-success") {
    view = <PaymentSuccess ctx={ctx} />;
  } else if (lower === "/api-key") {
    view = <ApiKey ctx={ctx} />;
  } else if (lower === "/perfil" || lower === "/profile" || lower === "/auth") {
    view = <Profile ctx={ctx} onLogout={logout} />;
  } else if (lower === "/about" || lower === "/use-cases" || lower === "/blog") {
    view = <Info page={lower.slice(1)} navigate={navigate} />;
  } else if (lower === "/verificar") {
    view = <Home key="verify" ctx={ctx} initialMode="verify" />;
  } else {
    view = <Home key="seal" ctx={ctx} initialMode="seal" />;
  }

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <button
              className="menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <MenuIcon size={22} />
            </button>
            <button className="brand" onClick={() => navigate("/")}>
              <img src="/trampto-logo.png" alt="TRAMPTO" />
              <span className="brand-name">TRAMPTO</span>
            </button>
          </div>
          <div className="header-right">
            {usage?.isPro ? (
              <span className="pill pill-pro">
                <CrownIcon size={13} /> {usage.isAdmin ? "ADMIN" : "PRO"} · Ilimitado
              </span>
            ) : (
              usage && (
                <button
                  className="pill pill-free pill-btn"
                  onClick={() => navigate("/payment")}
                  title="Suscríbete"
                >
                  Gratis: {usage.freeUsed}/{FREE_LIMIT}
                </button>
              )
            )}
            {session ? (
              <button
                className="header-login"
                onClick={() => navigate("/perfil")}
                title={session.user.email ?? "Mi perfil"}
              >
                <UserIcon size={14} />{" "}
                {(session.user.email ?? "Perfil").split("@")[0]}
              </button>
            ) : (
              <button className="header-login" onClick={() => navigate("/perfil")}>
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigate={navigate}
        path={path}
        session={session}
        usage={usage}
        onLogout={logout}
      />

      <main className="main">{view}</main>

      <Footer navigate={navigate} />
    </>
  );
};

export default App;
