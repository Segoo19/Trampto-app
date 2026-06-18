# TRAMPTO App

Versión **minimalista** de TRAMPTO: un único flujo para sellar y verificar documentos PDF. Sin menús, sin secciones — entras y subes tu documento.

## Qué hace

1. **Subes tu PDF** → se sella automáticamente en tu dispositivo:
   - Huella **SHA-256** del documento original
   - Sello visual TRAMPTO **página a página** + pie "Document secured with TRAMPTO"
   - La huella viaja dentro del PDF (metadatos `TRAMPTO-HASH:`)
   - Huella SHA-256 del PDF sellado final → **es la huella de verificación**
2. Obtienes al instante: **Seal ID**, **hash SHA-256**, **certificado de integridad** (PDF) y **enlace público único de verificación** (`/v/{hash}`).
3. **Compartir**: copiar enlace o compartir nativo.

> «A partir de este hash, tu documento es único en internet. No existen dos iguales.»

## Mismo backend que la web

La app usa el **mismo proyecto de Supabase** que la web (tablas `sealed_documents` y `subscriptions`, y la edge function `create-checkout` de Stripe). Un documento sellado en la app se verifica en la web y viceversa.

- **Gratis hasta 3 documentos** (cookie `trampto_free_used` para anónimos + conteo en BD para usuarios con cuenta, igual que la web).
- **Pro 1,99 €/mes**: botón "Hazte Pro" → Stripe Checkout (suscripción) → vuelta a `/payment-success` → desbloqueo inmediato (mismo upsert en `subscriptions` que hace la web).

## Planes y API

- **Individual · 1,99 €/mes**: documentos ilimitados (checkout `create-checkout`, vuelve a `/payment-success`).
- **Empresas · API · 1,99 €/mes**: además, clave API `trp_…` para integrar el sellado por REST (checkout `stripe-checkout`, vuelve a `/api-key?success=true`). La página `/api-key` muestra la clave, el uso mensual y la guía de integración (endpoints `api-seal` y `api-verify`).

## Cuenta admin

Los emails de `VITE_ADMIN_EMAILS` (por defecto `tramptooficial@gmail.com`) tienen **todo desbloqueado** sin pagar y ven el **panel de pruebas de la API** en `/api-key`: sella un PDF de prueba con la clave contra el propio TRAMPTO y verifica una huella real, mostrando la respuesta cruda para comprobar que la integración funciona. Nadie más ve ese panel.

Cuando Supabase esté restaurado: regístrate con ese email y ejecuta `setup-admin.sql` en el SQL Editor — crea tu suscripción PRO (10 años), tu empresa con clave API y las políticas RLS que necesitan la web y la app (incluido el registro de sellados anónimos).

### Acceso admin local (desarrollo)

En `localhost` el correo de confirmación de Supabase es poco práctico, así que en **modo desarrollo** (`npm run dev`) puedes entrar como admin **sin verificar el correo**: en "Iniciar sesión" escribe el email admin y la contraseña `trampto@19` (configurable con `VITE_ADMIN_DEV_PASSWORD`). Entras con todo desbloqueado y acceso al panel de pruebas de la API.

Este atajo **solo está activo en desarrollo** o si pones `VITE_ALLOW_LOCAL_ADMIN=true`; en el build de producción queda desactivado para no dejar una puerta trasera. En producción, la forma correcta es desactivar "Confirm email" en el dashboard de Supabase (Authentication → Sign In / Providers → Email) o confirmar el usuario con la service-role key.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # producción en dist/
```

Variables en `.env` (ya configuradas con el backend actual):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## PWA (instalable)

La app es una **PWA instalable** vía `vite-plugin-pwa` (`registerType: autoUpdate`):
- El **service worker** (`dist/sw.js`, Workbox) precachea la app y la sirve offline; se actualiza solo.
- El **manifest** lo genera el plugin (no hay `<link rel="manifest">` manual en `index.html`): `name: "Trampto"`, `display: standalone`, iconos normales + **maskable**, **screenshots** (wide/narrow) y **categories**.
- Iconos generados con `@vite-pwa/assets-generator` (`pwa-assets.config.ts`, fuente `public/icon-512.png`): `npx pwa-assets-generator`. Screenshots: `node gen-screenshots.mjs`.

Verificado tras `npm run build` + `npm run preview`: SW `activated` y controlando la página, manifest válido con icono maskable, un único `<link rel="manifest">`. En Chrome → DevTools → Application → Manifest aparece como **instalable** (botón "Instalar" en la barra). Nota: la *categoría PWA de Lighthouse* fue retirada de Chrome a finales de 2024; lo que se cumple son los criterios de instalabilidad.

## Despliegue (Vercel)

Importa la carpeta `trampto-app/` como proyecto (framework: Vite). El `vercel.json` incluido ya redirige todas las rutas al SPA. Configura las dos variables `VITE_*` en el panel de Vercel.

> Nota: la edge function `create-checkout` usa la cabecera `Origin` de la petición para construir las URLs de retorno de Stripe, por lo que el checkout devuelve al dominio de la app automáticamente.

## Estructura

```
src/
  lib/seal.ts      # núcleo: SHA-256, sellado página a página, certificado, registro
  lib/usage.ts     # límites free/pro + checkout Stripe + activación de suscripción
  lib/supabase.ts  # cliente compartido
  views/           # Home (sellar/verificar), PublicVerify, Payment, PaymentSuccess
  components/      # Dropzone, formulario de acceso, iconos
```
