import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

// Política de privacidad. Ruta pública /privacidad (sin login). No enlaza a
// trampto.com. Contenido por idioma (ES/EN) elegido según i18n.

interface Section {
  title: string;
  body: ReactNode;
}

const MAIL = <a href="mailto:tramptooficial@gmail.com">tramptooficial@gmail.com</a>;

const ES: { title: string; updated: string; back: string; sections: Section[] } = {
  title: "Política de privacidad",
  updated: "Última actualización: junio de 2026",
  back: "Volver al inicio",
  sections: [
    {
      title: "1. Quiénes somos",
      body: (
        <>
          <p>
            Trampto es una aplicación que sella y verifica la integridad de
            documentos PDF mediante una huella criptográfica SHA-256. Esta
            política explica qué datos tratamos y qué derechos tienes.
          </p>
          <p>Para cualquier cuestión, escríbenos a {MAIL}.</p>
        </>
      ),
    },
    {
      title: "2. Qué datos recogemos",
      body: (
        <ul>
          <li>
            <strong>Email de registro:</strong> si creas una cuenta, para
            identificarte y darte acceso.
          </li>
          <li>
            <strong>Documentos que procesas:</strong> al sellar calculamos su
            huella SHA-256. Según la arquitectura actual,{" "}
            <strong>no almacenamos el contenido del PDF</strong>: guardamos la
            huella, el nombre del archivo, el Seal ID y la fecha.
          </li>
          <li>
            <strong>Datos de suscripción y pago:</strong> el cobro lo procesa
            Stripe; no almacenamos los datos de tu tarjeta.
          </li>
          <li>
            <strong>Cookie técnica</strong> (<code>trampto_free_used</code>) para
            contar los documentos del plan gratuito en tu dispositivo.
          </li>
        </ul>
      ),
    },
    {
      title: "3. Para qué usamos los datos",
      body: (
        <>
          <ul>
            <li>Prestar el servicio de sellado y verificación.</li>
            <li>Gestionar tu cuenta y tu suscripción.</li>
            <li>Procesar los pagos.</li>
            <li>Permitir la verificación pública a partir de la huella.</li>
          </ul>
          <p>
            La base legal es la ejecución del contrato y, cuando proceda, tu
            consentimiento.
          </p>
        </>
      ),
    },
    {
      title: "4. Proveedores que tratan datos",
      body: (
        <ul>
          <li>
            <strong>Supabase</strong> — backend, base de datos y autenticación.
          </li>
          <li>
            <strong>Stripe</strong> — procesamiento de pagos.
          </li>
          <li>
            <strong>Vercel</strong> — alojamiento de la aplicación.
          </li>
        </ul>
      ),
    },
    {
      title: "5. Conservación de los datos",
      body: (
        <p>
          Conservamos los datos de tu cuenta mientras la mantengas activa. El
          registro de sellos se conserva para permitir la verificación. Puedes
          solicitar su supresión.
        </p>
      ),
    },
    {
      title: "6. Tus derechos (RGPD)",
      body: (
        <>
          <p>Tienes derecho a acceso, rectificación, supresión, oposición, limitación y portabilidad.</p>
          <p>
            Para ejercerlos, escríbenos a {MAIL}. También puedes reclamar ante la
            autoridad de control (en España, la AEPD).
          </p>
        </>
      ),
    },
    {
      title: "7. Seguridad",
      body: (
        <p>
          La aplicación se sirve por HTTPS. El contenido de los documentos que
          sellas en tu dispositivo no se transmite ni se almacena en nuestros
          servidores.
        </p>
      ),
    },
    {
      title: "8. Menores",
      body: <p>Trampto no está dirigido a menores de edad.</p>,
    },
    {
      title: "9. Cambios en esta política",
      body: <p>Publicaremos la versión vigente en esta misma página.</p>,
    },
    {
      title: "10. Contacto",
      body: <p>Responsable del tratamiento: Trampto. Contacto: {MAIL}.</p>,
    },
  ],
};

const EN: { title: string; updated: string; back: string; sections: Section[] } = {
  title: "Privacy policy",
  updated: "Last updated: June 2026",
  back: "Back to home",
  sections: [
    {
      title: "1. Who we are",
      body: (
        <>
          <p>
            Trampto is an app that seals and verifies the integrity of PDF
            documents using a SHA-256 cryptographic fingerprint. This policy
            explains what data we process and what rights you have.
          </p>
          <p>For any questions, email us at {MAIL}.</p>
        </>
      ),
    },
    {
      title: "2. What data we collect",
      body: (
        <ul>
          <li>
            <strong>Sign-up email:</strong> if you create an account, to identify
            you and give you access.
          </li>
          <li>
            <strong>Documents you process:</strong> when sealing, we compute their
            SHA-256 fingerprint. Under the current architecture,{" "}
            <strong>we do not store the PDF content</strong>: we store the
            fingerprint, the file name, the Seal ID and the date.
          </li>
          <li>
            <strong>Subscription and payment data:</strong> payment is processed
            by Stripe; we do not store your card details.
          </li>
          <li>
            <strong>Technical cookie</strong> (<code>trampto_free_used</code>) to
            count free-plan documents on your device.
          </li>
        </ul>
      ),
    },
    {
      title: "3. How we use the data",
      body: (
        <>
          <ul>
            <li>Provide the sealing and verification service.</li>
            <li>Manage your account and subscription.</li>
            <li>Process payments.</li>
            <li>Allow public verification from the fingerprint.</li>
          </ul>
          <p>
            The legal basis is performance of the contract and, where applicable,
            your consent.
          </p>
        </>
      ),
    },
    {
      title: "4. Providers that process data",
      body: (
        <ul>
          <li>
            <strong>Supabase</strong> — backend, database and authentication.
          </li>
          <li>
            <strong>Stripe</strong> — payment processing.
          </li>
          <li>
            <strong>Vercel</strong> — app hosting.
          </li>
        </ul>
      ),
    },
    {
      title: "5. Data retention",
      body: (
        <p>
          We keep your account data while your account is active. The seal
          registry is kept to allow verification over time. You can request its
          deletion.
        </p>
      ),
    },
    {
      title: "6. Your rights (GDPR)",
      body: (
        <>
          <p>You have the right to access, rectification, erasure, objection, restriction and portability.</p>
          <p>
            To exercise them, email us at {MAIL}. You may also complain to the
            competent supervisory authority.
          </p>
        </>
      ),
    },
    {
      title: "7. Security",
      body: (
        <p>
          The app is served over HTTPS. The content of the documents you seal on
          your device is neither transmitted nor stored on our servers.
        </p>
      ),
    },
    {
      title: "8. Minors",
      body: <p>Trampto is not intended for minors.</p>,
    },
    {
      title: "9. Changes to this policy",
      body: <p>We'll publish the current version on this page.</p>,
    },
    {
      title: "10. Contact",
      body: <p>Data controller: Trampto. Contact: {MAIL}.</p>,
    },
  ],
};

const Privacy = ({ navigate }: { navigate: (to: string) => void }) => {
  const { i18n } = useTranslation();
  const c = i18n.language.startsWith("en") ? EN : ES;

  return (
    <div className="info-page">
      <h1>{c.title}</h1>
      <p className="info-sub">{c.updated}</p>
      {c.sections.map((s) => (
        <div className="info-block" key={s.title}>
          <h2>{s.title}</h2>
          {s.body}
        </div>
      ))}
      <div className="center mt-24">
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          {c.back}
        </button>
      </div>
    </div>
  );
};

export default Privacy;
