-- Ordenar Helsinki: todo lo de la web XpertAuth en el esquema web; public queda para la app de ecografías.
-- Además, las tablas de la web antigua pasan al esquema "archivo" (no expuesto en la API).
-- Aplicar en el Supabase propio (supabase.xpertauth.com), en una sola transacción. No borra datos.
-- Después de aplicar: NOTIFY pgrst, 'reload schema';

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Mover a web: tablas, vista y funciones de la web XpertAuth
--    (los datos, índices, políticas RLS y permisos se conservan)
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.consultas_agente        set schema web;
alter table public.usuarios_web            set schema web;
alter view  public.uso_consultas_mensual   set schema web;

alter function public.limite_consultas_mes()               set schema web;
alter function public.registrar_consulta(uuid, text)       set schema web;
alter function public.consultas_restantes()                set schema web;
alter function public.alta_usuario_web()                   set schema web;

-- El trigger de alta lo ejecuta supabase_auth_admin: necesita poder entrar en el esquema web.
grant usage on schema web to supabase_auth_admin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Redefinir los cuerpos de las funciones (nombraban public.…)
--    El trigger on_auth_user_created_usuarios_web sigue apuntando a la misma función
--    (por identificador), ahora web.alta_usuario_web().
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function web.registrar_consulta(
  p_user   uuid,
  p_agente text
) returns table (permitido boolean, usadas integer, consulta_id bigint, limite integer)
language plpgsql
security definer
set search_path = web
as $$
declare
  v_inicio timestamptz := date_trunc('month', now() at time zone 'Europe/Madrid') at time zone 'Europe/Madrid';
  v_tope   integer := web.limite_consultas_mes();
  v_count  integer;
  v_id     bigint;
begin
  perform pg_advisory_xact_lock(hashtext(p_user::text));

  select count(*) into v_count
    from web.consultas_agente
   where user_id = p_user and created_at >= v_inicio;

  if v_count >= v_tope then
    return query select false, v_count, null::bigint, v_tope;
    return;
  end if;

  insert into web.consultas_agente (user_id, agente)
  values (p_user, p_agente)
  returning id into v_id;

  return query select true, v_count + 1, v_id, v_tope;
end;
$$;

create or replace function web.consultas_restantes()
returns integer
language sql
stable
security definer
set search_path = web
as $$
  select case
    when auth.uid() is null then null
    else greatest(
      web.limite_consultas_mes() - (
        select count(*)::integer
          from web.consultas_agente
         where user_id = auth.uid()
           and created_at >= date_trunc('month', now() at time zone 'Europe/Madrid') at time zone 'Europe/Madrid'
      ),
      0
    )
  end
$$;

create or replace function web.alta_usuario_web()
returns trigger
language plpgsql
security definer
set search_path = web
as $$
begin
  if coalesce(new.raw_app_meta_data->>'provider', '') = 'google' then
    insert into web.usuarios_web (id, email, nombre, fecha_alta)
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

-- Permisos (se conservan al mover; se reafirman por claridad)
revoke all on function web.limite_consultas_mes()          from public, anon, authenticated;
grant execute on function web.limite_consultas_mes()       to service_role;
revoke all on function web.registrar_consulta(uuid, text)  from public, anon, authenticated;
grant execute on function web.registrar_consulta(uuid, text) to service_role;
revoke all on function web.consultas_restantes()           from public, anon;
grant execute on function web.consultas_restantes()        to authenticated;
revoke all on function web.alta_usuario_web()              from public, anon, authenticated;
grant execute on function web.alta_usuario_web()           to supabase_auth_admin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Archivo de la web antigua: esquema nuevo, sin permisos para anon/authenticated/service_role
--    y fuera de PGRST_DB_SCHEMAS (no se expone en la API). No se borra nada.
-- ─────────────────────────────────────────────────────────────────────────────
create schema if not exists archivo;
revoke all on schema archivo from public, anon, authenticated, service_role;

alter table web.perfiles       set schema archivo;
alter table web.socios         set schema archivo;
alter table web.agent_sessions set schema archivo;

comment on table archivo.perfiles       is 'Archivo de la web antigua, sin uso';
comment on table archivo.socios         is 'Archivo de la web antigua, sin uso';
comment on table archivo.agent_sessions is 'Archivo de la web antigua, sin uso';

-- ─────────────────────────────────────────────────────────────────────────────
-- Deshacer (no forma parte de la migración): mover cada objeto de vuelta con
--   alter table archivo.perfiles set schema web;  (idem socios, agent_sessions)
--   alter table web.consultas_agente set schema public;  (idem usuarios_web, vista y funciones)
-- y redefinir los cuerpos con public.… (ver 20261001_usuarios_web.sql).
-- ─────────────────────────────────────────────────────────────────────────────
