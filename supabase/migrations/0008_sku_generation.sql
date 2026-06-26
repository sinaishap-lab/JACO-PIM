-- JACO-PIM — automatic SKU generation
-- Apply after 0007. Run in the Supabase SQL editor or `supabase db push`.
--
-- SKUs become auto-generated, so `sku` may be null until the product has the
-- parts to build one (supplier code + department/sub-department codes + a
-- per-department running number). Postgres treats NULLs as distinct, so the
-- unique constraint still holds.

alter table products alter column sku drop not null;

-- Running number assigned per department (1, 2, 3 … within each department).
alter table products add column product_number integer;
