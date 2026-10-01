-- LEX: función de búsqueda lex.match_lex_documentos_v2 (misma búsqueda que match_lex_documentos, devuelve además tipo).
-- SOLO DOCUMENTACIÓN: ya está aplicada en el Supabase propio (supabase.xpertauth.com) desde el 2026-10-01 (encargo 13).
-- No volver a ejecutar: "create function" fallaría porque ya existe.
-- Copia previa: /root/backups/pre-encargo13-20261001_180246.dump (Helsinki).
-- Ensayo previo en transacción con ROLLBACK: mismos 9 fragmentos, ids, similitudes y orden que la función antigua.
-- La función antigua lex.match_lex_documentos NO se modifica ni se borra (vuelta atrás: api/chat.ts vuelve a llamarla).
-- Permisos: los mismos que la antigua (ACL por defecto, sin grants explícitos).
-- Después de aplicar: NOTIFY pgrst, 'reload schema';
-- Vuelta atrás de la función nueva: drop function lex.match_lex_documentos_v2(vector, double precision, integer, text);

create function lex.match_lex_documentos_v2(
  query_embedding vector,
  match_threshold double precision,
  match_count integer,
  p_tipo text default null           -- opcional: si llega, filtra por lex_documentos.tipo ('oficial' / 'paralelo')
)
returns table(id bigint, contenido text, fuente text, bloque text, archivo text, tipo text, similarity double precision)
language sql
stable
as $fn$
  select d.id, d.contenido, d.fuente, d.bloque, d.archivo, d.tipo,
         1 - (d.embedding <=> query_embedding) as similarity
  from lex.lex_documentos d
  where 1 - (d.embedding <=> query_embedding) > match_threshold
    and (p_tipo is null or d.tipo = p_tipo)
  order by d.embedding <=> query_embedding
  limit match_count;
$fn$;
