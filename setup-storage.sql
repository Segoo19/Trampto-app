-- ============================================================
-- TRAMPTO · Almacenamiento de documentos sellados
-- ============================================================
-- Crea el bucket público 'sealed-docs' para que el RECEPTOR pueda ver/descargar
-- el documento desde el enlace de verificación (/v/{hash}).
-- Ejecutar en Supabase → SQL Editor. Es idempotente.
--
-- Modelo de seguridad (aplica skills rls-supabase + input-validation):
--   - Bucket PÚBLICO: lectura por URL (la clave es la huella de 64 hex,
--     imposible de adivinar → solo accede quien tiene el enlace).
--   - Límite de 50 MB y solo application/pdf (evita abuso por payloads grandes).
--   - Se permite SOLO INSERT (subir uno nuevo). NO se crean políticas de UPDATE
--     ni DELETE → un documento ya sellado es INMUTABLE: nadie puede sobrescribir
--     ni borrar el PDF de una huella válida (integridad garantizada por RLS).
--
-- ⚠️ Nota de abuso residual: al permitir INSERT anónimo, alguien podría subir
-- PDFs basura a nombres aleatorios (gasto de almacenamiento). Mitigación futura
-- recomendada (skill rate-limiting): mover la subida detrás de una edge function
-- con límite por IP. Para la v1, los límites de tamaño/tipo son suficientes.
-- ============================================================

-- 1. Bucket público con límites
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('sealed-docs', 'sealed-docs', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 52428800,
      allowed_mime_types = ARRAY['application/pdf'];

-- 2. Permitir SUBIR (solo INSERT) a cualquiera. Sin UPDATE/DELETE = inmutable.
DROP POLICY IF EXISTS "sealed_docs_insert" ON storage.objects;
CREATE POLICY "sealed_docs_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'sealed-docs');

-- La lectura es pública por ser un bucket público: getPublicUrl funciona sin
-- política de SELECT adicional. No añadimos políticas de UPDATE/DELETE a propósito.

-- 3. Comprobación
SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets WHERE id = 'sealed-docs';
