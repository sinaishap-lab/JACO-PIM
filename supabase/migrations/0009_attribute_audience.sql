-- JACO-PIM — split attributes into supplier (internal) vs customer (marketing)
-- Apply after 0008. Run in the Supabase SQL editor or `supabase db push`.
--
-- Every attribute definition belongs to one of two audiences:
--   'supplier' — internal data (print technique, materials, supplier notes…)
--   'customer' — marketing data shown to customers (marketing name, video…)
-- This drives two separate sections on the product page.

alter table attribute_definitions
  add column audience text not null default 'supplier'
    check (audience in ('supplier', 'customer'));
