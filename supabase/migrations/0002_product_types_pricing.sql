-- JACO-PIM — product types, pricing, and bill-of-materials (BOM)
-- Apply after 0001. Run in the Supabase SQL editor or `supabase db push`.

-- ─────────────────────────────────────────────────────────────
-- Product type + pricing
--   finished      = end product, sellable, has a sale price
--   raw_material  = component, not sold as-is, has a cost price
-- ─────────────────────────────────────────────────────────────
alter table products
  add column type text not null default 'finished'
    check (type in ('finished', 'raw_material')),
  add column cost_price numeric(12, 2),
  add column sale_price numeric(12, 2);

-- ─────────────────────────────────────────────────────────────
-- Bill of materials — which raw materials a finished product is made of.
--   product_id   → the finished product
--   component_id → the raw material it uses
--   quantity     → how much of the component is used
-- Finished-product cost is computed as SUM(component.cost_price * quantity).
-- ─────────────────────────────────────────────────────────────
create table product_components (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products (id) on delete cascade,
  component_id uuid not null references products (id) on delete restrict,
  quantity     numeric(12, 4) not null default 1 check (quantity > 0),
  unique (product_id, component_id),
  check (product_id <> component_id)
);

create index idx_product_components_product on product_components (product_id);
create index idx_product_components_component on product_components (component_id);
