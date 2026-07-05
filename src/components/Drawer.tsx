import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { AppSession } from "../types";
import type { Usage } from "../lib/usage";
import { FREE_LIMIT } from "../lib/usage";
import { useLocalPrice } from "../lib/currency";
import {
  BookIcon,
  CrownIcon,
  FileIcon,
  KeyIcon,
  LogOutIcon,
  ShieldCheckIcon,
  StampIcon,
  UserIcon,
  XIcon,
} from "./Icons";

interface Props {
  open: boolean;
  onClose: () => void;
  navigate: (to: string) => void;
  path: string;
  session: AppSession | null;
  usage: Usage | null;
  onLogout: () => void;
}

const Drawer = ({ open, onClose, navigate, path, session, usage, onLogout }: Props) => {
  const { t } = useTranslation();
  const price = useLocalPrice();
  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const go = (to: string) => () => {
    navigate(to);
    onClose();
  };

  const lower = path.toLowerCase();
  const isActive = (to: string) => lower === to;

  const Item = ({
    to,
    icon,
    label,
    onClick,
  }: {
    to?: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }) => (
    <button
      className={`drawer-link ${to && isActive(to) ? "active" : ""}`}
      onClick={onClick ?? (to ? go(to) : undefined)}
    >
      <span className="drawer-ico">{icon}</span>
      {label}
    </button>
  );

  return (
    <>
      <div
        className={`drawer-backdrop ${open ? "show" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="drawer-head">
          <button className="brand" onClick={go("/")}>
            <img src="/trampto-logo.png" alt="TRAMPTO" />
            <span className="brand-name">TRAMPTO</span>
          </button>
          <button className="drawer-close" onClick={onClose} aria-label={t("drawer.closeMenu")}>
            <XIcon size={20} />
          </button>
        </div>

        <nav className="drawer-nav">
          <div className="drawer-group">
            <Item to="/" icon={<StampIcon size={19} />} label={t("tabs.seal")} />
            <Item
              to="/verificar"
              icon={<ShieldCheckIcon size={19} />}
              label={t("tabs.verify")}
            />
          </div>

          <div className="drawer-group">
            <h6>{t("drawer.resources")}</h6>
            <Item to="/use-cases" icon={<FileIcon size={18} />} label={t("drawer.useCases")} />
            <Item to="/blog" icon={<BookIcon size={18} />} label={t("drawer.blog")} />
            <Item to="/about" icon={<BookIcon size={18} />} label={t("drawer.about")} />
          </div>

          <div className="drawer-group">
            <h6>{t("drawer.subscribe")}</h6>
            <Item to="/payment" icon={<CrownIcon size={18} />} label={t("drawer.planBusiness", { price: price.text })} />
            <Item to="/api-key" icon={<KeyIcon size={18} />} label={t("drawer.apiForBusiness")} />
          </div>

          <div className="drawer-group">
            <h6>{t("drawer.account")}</h6>
            <Item
              to="/perfil"
              icon={<UserIcon size={18} />}
              label={session ? t("drawer.myProfile") : t("header.signIn")}
            />
            {session && (
              <Item
                icon={<LogOutIcon size={18} />}
                label={t("drawer.logout")}
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              />
            )}
          </div>
        </nav>

        <div className="drawer-foot">
          {usage?.isPro ? (
            <span className="pill pill-pro">
              <CrownIcon size={12} /> {usage.isAdmin ? t("header.admin") : t("header.pro")}
            </span>
          ) : (
            usage && (
              <span className="pill pill-free">
                {t("header.available", { used: usage.freeUsed, limit: FREE_LIMIT })}
              </span>
            )
          )}
        </div>
      </aside>
    </>
  );
};

export default Drawer;
