import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckIcon,
  CopyIcon,
  MailIcon,
  OutlookIcon,
  ShareIcon,
  WhatsAppIcon,
} from "./Icons";

// Menú de compartir: SIEMPRE comparte la url que se le pasa (la página pública
// de verificación de este documento), con opciones de WhatsApp, Correo y Outlook.
const ShareMenu = ({
  url,
  text,
  label = "Compartir",
}: {
  url: string;
  text?: string;
  label?: string;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const msg = text ?? t("share.defaultText");
  const enc = encodeURIComponent;
  const subject = t("share.subject");
  const body = `${msg}\n\n${url}`;
  const whatsapp = `https://wa.me/?text=${enc(`${msg} ${url}`)}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&su=${enc(
    subject
  )}&body=${enc(body)}`;
  const outlook = `https://outlook.office.com/mail/deeplink/compose?subject=${enc(
    subject
  )}&body=${enc(body)}`;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="share-wrap" ref={ref}>
      <button className="btn btn-gold" onClick={() => setOpen((o) => !o)}>
        <ShareIcon size={17} /> {label}
      </button>
      {open && (
        <div className="share-menu" role="menu">
          <a
            className="share-opt wa"
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            <WhatsAppIcon size={18} /> WhatsApp
          </a>
          <a
            className="share-opt gmail"
            href={gmail}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            <MailIcon size={18} /> Gmail
          </a>
          <a
            className="share-opt ol"
            href={outlook}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            <OutlookIcon size={18} /> Outlook
          </a>
          <button className="share-opt" onClick={copy}>
            {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
            {copied ? t("share.copied") : t("share.copyLink")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareMenu;
