-- JACO-PIM — suppliers and product↔supplier links
-- Apply after 0003. Run in the Supabase SQL editor or `supabase db push`.

-- ─────────────────────────────────────────────────────────────
-- Suppliers — the vendors that supply products / raw materials.
-- ─────────────────────────────────────────────────────────────
create table suppliers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  contact_name text,
  phone        text,
  email        text,
  notes        text,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Product ↔ supplier — a product can be supplied by several vendors,
-- each with their own price, part number, and product name.
-- Effective product cost = the cheapest supplier (or the preferred one).
-- ─────────────────────────────────────────────────────────────
create table product_suppliers (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products (id) on delete cascade,
  supplier_id   uuid not null references suppliers (id) on delete cascade,
  supplier_sku  text,                 -- the supplier's part number
  supplier_name text,                 -- the supplier's name for the product
  cost_price    numeric(12, 2),       -- this supplier's price (per package)
  is_preferred  boolean not null default false,
  unique (product_id, supplier_id)
);

create index idx_product_suppliers_product on product_suppliers (product_id);
create index idx_product_suppliers_supplier on product_suppliers (supplier_id);
