-- JACO-PIM — re-disable RLS on all public tables
-- Run in the Supabase SQL editor.
--
-- Tables created after 0011 (e.g. supplier_variant_skus) had RLS enabled by
-- default, which blocks inserts ("new row violates row-level security policy").
-- This re-runs the disable loop over every public table; safe to run anytime.

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
