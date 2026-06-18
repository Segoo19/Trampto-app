-- ============================================================
-- TRAMPTO · Configuración de la cuenta ADMIN (David)
-- ============================================================
-- Ejecutar en Supabase → SQL Editor cuando el proyecto esté
-- restaurado. ANTES, REGÍSTRATE en la app/web con el email de
-- admin (por defecto tramptooficial@gmail.com) para que exista
-- en auth.users.
--
-- Es idempotente: se puede ejecutar varias veces sin error.
-- No usa ON CONFLICT (evita el error 42P10): comprueba si la
-- fila existe y hace INSERT o UPDATE según el caso.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Estructura que la app y la web necesitan (antes de nada)
-- ------------------------------------------------------------

-- Tabla de uso de la API (la usa la edge function api-seal)
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  document_hash TEXT,
  filename TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Columna company_id en profiles (la usa la app para localizar la empresa)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID;

-- Índices únicos necesarios para los upsert del cliente
-- (companies por email, subscriptions por user_id).
CREATE UNIQUE INDEX IF NOT EXISTS companies_email_unique
  ON public.companies (email);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_unique
  ON public.subscriptions (user_id);

-- ------------------------------------------------------------
-- 1. Dar de alta al admin: suscripción PRO + empresa con API key
-- ------------------------------------------------------------
DO $$
DECLARE
  admin_email TEXT := 'tramptooficial@gmail.com';  -- ← cambia aquí si usas otro
  admin_id UUID;
  admin_company_id UUID;
  existing_sub UUID;
  new_api_key TEXT := 'trp_' || replace(gen_random_uuid()::text, '-', '');
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No existe usuario con email %. Regístrate primero en la app.', admin_email;
  END IF;

  -- 1a. Suscripción PRO de 10 años (sin ON CONFLICT)
  SELECT id INTO existing_sub FROM public.subscriptions WHERE user_id = admin_id LIMIT 1;
  IF existing_sub IS NULL THEN
    INSERT INTO public.subscriptions
      (user_id, stripe_subscription_id, stripe_customer_id, status, expires_at)
    VALUES
      (admin_id, 'admin_manual', 'admin_manual', 'active', now() + interval '10 years');
  ELSE
    UPDATE public.subscriptions
      SET status = 'active', expires_at = now() + interval '10 years'
      WHERE id = existing_sub;
  END IF;

  -- 1b. Empresa con clave API activa (sin ON CONFLICT)
  SELECT id INTO admin_company_id FROM public.companies WHERE email = admin_email LIMIT 1;
  IF admin_company_id IS NULL THEN
    INSERT INTO public.companies (name, email, api_key, subscription_status)
    VALUES ('TRAMPTO Admin', admin_email, new_api_key, 'active')
    RETURNING id INTO admin_company_id;
  ELSE
    UPDATE public.companies
      SET subscription_status = 'active',
          api_key = COALESCE(api_key, new_api_key)
      WHERE id = admin_company_id;
  END IF;

  -- 1c. Vincular el perfil con la empresa (opcional; la app también la
  --     encuentra por email, así que si falla no es crítico)
  BEGIN
    UPDATE public.profiles SET company_id = admin_company_id WHERE user_id = admin_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No se pudo vincular profiles.company_id: %', SQLERRM;
  END;

  RAISE NOTICE 'Admin listo. user_id=% company_id=%', admin_id, admin_company_id;
END $$;

-- ------------------------------------------------------------
-- 2. Políticas RLS que la app y la web necesitan
-- ------------------------------------------------------------

-- companies: el dueño (por email del JWT) puede ver/crear/actualizar su empresa
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
CREATE POLICY "Users can view own company" ON public.companies
  FOR SELECT USING (email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Users can update own company" ON public.companies;
CREATE POLICY "Users can update own company" ON public.companies
  FOR UPDATE USING (email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Users can insert own company" ON public.companies;
CREATE POLICY "Users can insert own company" ON public.companies
  FOR INSERT WITH CHECK (email = auth.jwt() ->> 'email');

-- api_usage: cada empresa ve su propio uso
DROP POLICY IF EXISTS "Company can view own usage" ON public.api_usage;
CREATE POLICY "Company can view own usage" ON public.api_usage
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE email = auth.jwt() ->> 'email')
  );

-- sealed_documents: permitir registrar sellados ANÓNIMOS (user_id NULL),
-- como hacen la web y la app cuando no hay sesión
DROP POLICY IF EXISTS "Users can insert their own sealed documents" ON public.sealed_documents;
CREATE POLICY "Users can insert their own sealed documents" ON public.sealed_documents
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- subscriptions: la web/app activan la suscripción al volver de Stripe
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. Comprobar el resultado
-- ------------------------------------------------------------
SELECT c.name, c.email, c.api_key, c.subscription_status
FROM public.companies c
WHERE c.email = 'tramptooficial@gmail.com';
