-- JACO-PIM — supplier short code (used as the prefix in generated SKUs)
-- Apply after 0005. Run in the Supabase SQL editor or `supabase db push`.

alter table suppliers
  add column code text;
