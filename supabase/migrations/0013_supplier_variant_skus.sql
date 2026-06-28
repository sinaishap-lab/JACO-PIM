-- JACO-PIM — per-variant supplier SKUs
-- Run in the Supabase SQL editor.
--
-- A supplier can have a different part number for each size × color variant of
-- a product. Variants are identified by their size and color VALUES (matching
-- product_sizes.value / product_colors.value); an absent axis is stored as ''
-- so the unique constraint holds (Postgres treats NULLs as distinct).

create table if not exists supplier_variant_skus (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products (id) on delete cascade,
  supplier_id uuid not null references suppliers (id) on delete cascade,
  size_value  text not null default '',
  color_value text not null default '',
  sku         text not null,
  unique (product_id, supplier_id, size_value, color_value)
);

create index if not exists idx_supplier_variant_skus_product
  on supplier_variant_skus (product_id);

notify pgrst, 'reload schema';
