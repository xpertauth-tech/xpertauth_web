-- Registro de usuarios de la web (solo Google), control de uso mensual y contador de consultas.
-- Aplicar en el Supabase propio (supabase.xpertauth.com). Idempotente: se puede relanzar.
-- Los usuarios de email son de la app de ecografías y NO entran en usuarios_web.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Límite mensual: ÚNICA fuente del 30.
--    Lo leen registrar_consulta (que además lo devuelve a api/chat.ts), la vista
--    de uso y consultas_restantes(). Para cambiarlo, cambiar solo esta función.
--    (El texto "30 consultas" de la ventana de límite alcanzado, en
--    AgentChat.tsx, es texto traducido y sigue siendo manual.)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.limite_consultas_mes()
returns integer
language sql
immutable
as $$ select 30 $$;

revoke all on function public.limite_consultas_mes() from public, anon, authenticated;
grant execute on function public.limite_consultas_mes() to service_role;

-- registrar_consulta deja de recibir el límite: lo toma de limite_consultas_mes()
-- y lo devuelve en la fila (columna "limite") para que api/chat.ts no lo duplique.
drop function if exists public.registrar_consulta(uuid, text, integer);

create or replace function public.registrar_consulta(
  p_user   uuid,
  p_agente text
) returns table (permitido boolean, usadas integer, consulta_id bigint, limite integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inicio timestamptz := date_trunc('month', now() at time zone 'Europe/Madrid') at time zone 'Europe/Madrid';
  v_tope   integer := public.limite_consultas_mes();
  v_count  integer;
  v_id     bigint;
begin
  perform pg_advisory_xact_lock(hashtext(p_user::text));

  select count(*) into v_count
    from public.consultas_agente
   where user_id = p_user and created_at >= v_inicio;

  if v_count >= v_tope then
    return query select false, v_count, null::bigint, v_tope;
    return;
  end if;

  insert into public.consultas_agente (user_id, agente)
  values (p_user, p_agente)
  returning id into v_id;

  return query select true, v_count + 1, v_id, v_tope;
end;
$$;

revoke all on function public.registrar_consulta(uuid, text) from public, anon, authenticated;
grant execute on function public.registrar_consulta(uuid, text) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Tabla de personas registradas en la web
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.usuarios_web (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  nombre      text,
  fecha_alta  timestamptz not null default now()
);

alter table public.usuarios_web enable row level security;

-- Cada usuario solo puede leer su propia fila.
drop policy if exists usuarios_web_lee_la_suya on public.usuarios_web;
create policy usuarios_web_lee_la_suya
  on public.usuarios_web
  for select
  to authenticated
  using (id = auth.uid());

-- Nadie escribe desde el navegador: solo lectura para authenticated, nada para anon.
-- (Sin políticas de insert/update/delete y sin esos privilegios.)
revoke all on public.usuarios_web from public, anon, authenticated;
grant select on public.usuarios_web to authenticated;
grant all on public.usuarios_web to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Alta automática al crearse un usuario en auth.users, solo si el proveedor es Google
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.alta_usuario_web()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_app_meta_data->>'provider', '') = 'google' then
    insert into public.usuarios_web (id, email, nombre, fecha_alta)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
      new.created_at
    )
    on conflict (id) do nothing;
  end if;
  return new;
exception when others then
  -- Un fallo aquí nunca debe impedir que la persona entre.
  raise warning 'alta_usuario_web: % (%)', sqlerrm, sqlstate;
  return new;
end;
$$;

revoke all on function public.alta_usuario_web() from public, anon, authenticated;
grant execute on function public.alta_usuario_web() to supabase_auth_admin;

drop trigger if exists on_auth_user_created_usuarios_web on auth.users;
create trigger on_auth_user_created_usuarios_web
  after insert on auth.users
  for each row execute function public.alta_usuario_web();

-- Alta de los usuarios de Google que ya existen (hoy, solo el de José Luis).
insert into public.usuarios_web (id, email, nombre, fecha_alta)
select u.id,
       u.email,
       coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
       u.created_at
  from auth.users u
 where coalesce(u.raw_app_meta_data->>'provider', '') = 'google'
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Vista de control de uso: por persona y mes (hora de Madrid)
--    Aparece una fila por persona y mes desde su alta, también con 0 consultas.
--    Solo service_role; con security_invoker no abre nada que RLS cierre.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace view public.uso_consultas_mensual
with (security_invoker = true) as
with meses as (
  select date_trunc('month', c.created_at at time zone 'Europe/Madrid') as mes
    from public.consultas_agente c
  union
  select date_trunc('month', now() at time zone 'Europe/Madrid')
)
select u.email,
       u.nombre,
       to_char(m.mes, 'YYYY-MM')                                        as mes,
       count(c.id)::integer                                             as consultas,
       greatest(public.limite_consultas_mes() - count(c.id)::integer, 0) as restantes,
       max(c.created_at) at time zone 'Europe/Madrid'                   as ultima_consulta
  from public.usuarios_web u
  join meses m
    on m.mes >= date_trunc('month', u.fecha_alta at time zone 'Europe/Madrid')
  left join public.consultas_agente c
    on c.user_id = u.id
   and date_trunc('month', c.created_at at time zone 'Europe/Madrid') = m.mes
 group by u.id, u.email, u.nombre, m.mes
 order by m.mes desc, consultas desc, u.email;

revoke all on public.uso_consultas_mensual from public, anon, authenticated;
grant select on public.uso_consultas_mensual to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Consultas que le quedan a la persona autenticada este mes (para el navbar)
--    Devuelve null si no hay sesión.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.consultas_restantes()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then null
    else greatest(
      public.limite_consultas_mes() - (
        select count(*)::integer
          from public.consultas_agente
         where user_id = auth.uid()
           and created_at >= date_trunc('month', now() at time zone 'Europe/Madrid') at time zone 'Europe/Madrid'
      ),
      0
    )
  end
$$;

revoke all on function public.consultas_restantes() from public, anon;
grant execute on function public.consultas_restantes() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Deshacer (no forma parte de la migración):
--   drop function if exists public.consultas_restantes();
--   drop view     if exists public.uso_consultas_mensual;
--   drop trigger  if exists on_auth_user_created_usuarios_web on auth.users;
--   drop function if exists public.alta_usuario_web();
--   drop table    if exists public.usuarios_web;
--   drop function if exists public.limite_consultas_mes();
-- ─────────────────────────────────────────────────────────────────────────────
