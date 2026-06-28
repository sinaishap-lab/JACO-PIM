-- JACO-PIM — disable Row Level Security (no auth yet)
-- Run in the Supabase SQL editor.
--
-- The app currently has no users or permissions, and all access goes through
-- the server using the anon key. RLS (enabled by default on some projects)
-- blocks every insert/update because no policies are defined, e.g.:
--   "new row violates row-level security policy for table departments".
--
-- We turn RLS OFF on every table in the public schema. When authentication is
-- introduced later, re-enable RLS and add proper policies per table.

do $$
declare
  t record;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I disable row level security', t.tablename);
  end loop;
end $$;

notify pgrst, 'reload schema';
