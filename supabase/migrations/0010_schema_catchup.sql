-- JACO-PIM — schema catch-up (idempotent)
-- Safe to run even if some objects already exist. Use this if migrations were
-- applied out of order or partially. It ensures every table/column from
-- 0002–0009 exists. Run once in the Supabase SQL editor.

-- ── 0002: product type + pricing ────────────────────────────────────────────
alter table products
  add column if not exists type text not null default 'finished';
do $$ begin
  alter table products
    add constraint products_type_check check (type in ('finished', 'raw_material'));
exception when duplicate_object then null; end $$;
alter table products add column if not exists cost_price numeric(12, 2);
alter table products add column if not exists sale_price numeric(12, 2);

create table if not exists product_components (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products (id) on delete cascade,
  component_id uuid not null references products (id) on delete restrict,
  quantity     numeric(12, 4) not null default 1 check (quantity > 0),
  unique (product_id, component_id),
  check (product_id <> component_id)
);
create index if not exists idx_product_components_product on product_components (product_id);
create index if not exists idx_product_components_component on product_components (component_id);

-- ── 0003: raw-material units ────────────────────────────────────────────────
alter table products add column if not exists pack_unit text;
alter table products add column if not exists content_amount numeric(12, 4);
do $$ begin
  alter table products
    add constraint products_content_amount_check
      check (content_amount is null or content_amount > 0);
exception when duplicate_object then null; end $$;
alter table products add column if not exists usage_unit text;

-- ── 0004: suppliers + product↔supplier links ────────────────────────────────
create table if not exists suppliers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  contact_name text,
  phone        text,
  email        text,
  notes        text,
  created_at   timestamptz not null default now()
);

create table if not exists product_suppliers (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products (id) on delete cascade,
  supplier_id   uuid not null references suppliers (id) on delete cascade,
  supplier_sku  text,
  supplier_name text,
  cost_price    numeric(12, 2),
  is_preferred  boolean not null default false,
  unique (product_id, supplier_id)
);
create index if not exists idx_product_suppliers_product on product_suppliers (product_id);
create index if not exists idx_product_suppliers_supplier on product_suppliers (supplier_id);

-- ── 0005: classification (department → sub-department → model) ───────────────
create table if not exists departments (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  code text
);
create table if not exists sub_departments (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments (id) on delete cascade,
  name          text not null,
  code          text
);
create table if not exists models (
  id                uuid primary key default gen_random_uuid(),
  sub_department_id uuid not null references sub_departments (id) on delete cascade,
  name              text not null,
  code              text
);
create index if not exists idx_sub_departments_department on sub_departments (department_id);
create index if not exists idx_models_sub_department on models (sub_department_id);

alter table products add column if not exists department_id uuid references departments (id) on delete set null;
alter table products add column if not exists sub_department_id uuid references sub_departments (id) on delete set null;
alter table products add column if not exists model_id uuid references models (id) on delete set null;

-- ── 0006: supplier short code ───────────────────────────────────────────────
alter table suppliers add column if not exists code text;

-- ── 0007: variants (sizes + colors) ─────────────────────────────────────────
create table if not exists product_sizes (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  value      text not null,
  price      numeric(12, 2),
  unique (product_id, value)
);
create table if not exists product_colors (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  value      text not null,
  letter     text,
  unique (product_id, value)
);
create index if not exists idx_product_sizes_product on product_sizes (product_id);
create index if not exists idx_product_colors_product on product_colors (product_id);

-- ── 0008: SKU generation ────────────────────────────────────────────────────
alter table products alter column sku drop not null;
alter table products add column if not exists product_number integer;

-- ── 0009: attribute audience ────────────────────────────────────────────────
alter table attribute_definitions
  add column if not exists audience text not null default 'supplier';
do $$ begin
  alter table attribute_definitions
    add constraint attribute_definitions_audience_check
      check (audience in ('supplier', 'customer'));
exception when duplicate_object then null; end $$;

-- Refresh PostgREST's schema cache so the new columns are visible immediately.
notify pgrst, 'reload schema';
