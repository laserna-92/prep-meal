-- LOCAL TEST ONLY — emulates the pieces of Supabase's `auth` schema the
-- migrations depend on. Real Supabase provides these; never run in production.
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);

-- auth.uid() reads the current user id from a GUC we set per test session.
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

-- Roles referenced by GRANTs in the RLS migration.
do $$ begin
  if not exists (select from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
  if not exists (select from pg_roles where rolname = 'service_role') then create role service_role; end if;
end $$;

-- Supabase grants table/sequence privileges to these roles automatically; emulate
-- that here so RLS (not missing GRANTs) is what governs access in the tests.
grant usage on schema public to anon, authenticated;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant select on auth.users to anon, authenticated;
alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant all on sequences to authenticated;
alter default privileges in schema public grant select on tables to anon;
