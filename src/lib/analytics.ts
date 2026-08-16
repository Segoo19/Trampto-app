// Analítica opcional. DESACTIVADA salvo que definas VITE_GA_ID (id de GA4, tipo
// "G-XXXXXXXXXX") en las variables de entorno del despliegue. Sin ese id no se
// carga ningún script de terceros ni cookies.
//
// Nota de privacidad: GA usa cookies y en la UE requiere consentimiento. Como
// TRAMPTO es un producto centrado en la privacidad, valora una alternativa sin
// cookies (Vercel Web Analytics o Plausible), que no necesita banner. Si activas
// GA, actualiza la Política de privacidad para reflejarlo.
export function initAnalytics(): void {
  const id = import.meta.env.VITE_GA_ID as string | undefined;
  if (!id) return;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);

  const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  // anonymize_ip reduce el dato personal; aun así GA sigue usando cookies.
  w.gtag("config", id, { anonymize_ip: true });
}
