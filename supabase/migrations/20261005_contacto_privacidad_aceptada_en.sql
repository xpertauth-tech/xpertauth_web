-- Formulario de contacto: constancia de la aceptación de la política de privacidad.
-- Añade web.contacto.privacidad_aceptada_en (fecha y hora, UTC) que api/contacto.ts rellena
-- solo cuando la petición trae la aceptación; sin ella, el servidor rechaza el envío.
-- Aplicar en el Supabase propio (supabase.xpertauth.com). Idempotente. No borra ni modifica datos.
-- Los mensajes anteriores a este cambio (2 en el momento de aplicarla) quedan en NULL: entonces
-- no se guardaba constancia, y NULL lo refleja con honestidad.
-- Después de aplicar: NOTIFY pgrst, 'reload schema';
--
-- Cómo se aplicó (2026-10-02, Helsinki):
--   1. Diagnóstico: 11 columnas, 2 filas, RLS activa, sin disparadores, políticas ni vistas dependientes.
--   2. Copia de seguridad de las filas y la estructura fuera del repositorio (contiene datos personales).
--   3. Ensayo en transacción con ROLLBACK: 12 columnas dentro; tras la vuelta atrás, 11.
--   4. Aplicación real y NOTIFY pgrst.

alter table web.contacto add column if not exists privacidad_aceptada_en timestamptz;

comment on column web.contacto.privacidad_aceptada_en is
  'Momento en que la persona marcó la casilla de la política de privacidad (lo fija el servidor). NULL = anterior a este registro.';

notify pgrst, 'reload schema';

-- Deshacer (no forma parte de la migración):
--   alter table web.contacto drop column privacidad_aceptada_en;
