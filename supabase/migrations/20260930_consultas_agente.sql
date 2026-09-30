-- Consultas a los agentes LEX/NOVA: registro por usuario y control del límite mensual.
-- Aplicar en el Supabase propio (supabase.xpertauth.com). Solo la service_role accede.

create table if not exists public.consultas_agente (
  id                bigint generated always as identity primary key,
  user_id           uuid not null references auth.users(id) on delete cascade,
  agente            text not null check (agente in ('LEX', 'NOVA')),
  created_at        timestamptz not null default now(),
  -- Uso real de la consulta (lo rellena api/chat.ts tras la respuesta)
  model             text,
  input_tokens      integer,
  output_tokens     integer,
  embedding_tokens  integer
);

create index if not exists consultas_agente_user_mes_idx
  on public.consultas_agente (user_id, created_at);

alter table public.consultas_agente enable row level security;
-- Sin políticas: anon y authenticated no pueden leer ni escribir; service_role sí (salta RLS).

-- Reserva atómica de una consulta: cuenta las del mes en curso (hora de Madrid),
-- y si no se ha llegado al límite inserta la fila. Bloqueo por usuario para evitar
-- que dos peticiones simultáneas se cuelen por encima del tope.
create or replace function public.registrar_consulta(
  p_user   uuid,
  p_agente text,
  p_limite integer
) returns table (permitido boolean, usadas integer, consulta_id bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inicio timestamptz := date_trunc('month', now() at time zone 'Europe/Madrid') at time zone 'Europe/Madrid';
  v_count  integer;
  v_id     bigint;
begin
  perform pg_advisory_xact_lock(hashtext(p_user::text));

  select count(*) into v_count
    from public.consultas_agente
   where user_id = p_user and created_at >= v_inicio;

  if v_count >= p_limite then
    return query select false, v_count, null::bigint;
    return;
  end if;

  insert into public.consultas_agente (user_id, agente)
  values (p_user, p_agente)
  returning id into v_id;

  return query select true, v_count + 1, v_id;
end;
$$;

revoke all on function public.registrar_consulta(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.registrar_consulta(uuid, text, integer) to service_role;
