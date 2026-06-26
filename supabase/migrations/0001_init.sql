-- JACO-PIM — initial schema
-- Product Information Management core model.
-- Apply with the Supabase CLI:  supabase db push   (or run in the SQL editor)

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Keeps updated_at fresh on every UPDATE.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Products — the master record (single source of truth)
-- ─────────────────────────────────────────────────────────────
create table products (
  id          uuid primary key default gen_random_uuid(),
  sku         text not null unique,
  name        text not null,
  description text,
  status      text not null default 'draft'
              check (status in ('draft', 'published', 'archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Categories — hierarchical (self-referencing tree)
-- ─────────────────────────────────────────────────────────────
create table categories (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  slug      text not null unique,
  parent_id uuid references categories (id) on delete set null,
  position  int not null default 0
);

create table product_categories (
  product_id  uuid not null references products (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  primary key (product_id, category_id)
);

-- ─────────────────────────────────────────────────────────────
-- Dynamic attributes — definition (schema) vs value
-- ─────────────────────────────────────────────────────────────
create table attribute_groups (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  position int not null default 0
);

create table attribute_definitions (
  id       uuid primary key default gen_random_uuid(),
  key      text not null unique,
  label    text not null,
  type     text not null
           check (type in ('text','number','boolean','select',
                           'multiselect','date','rich_text')),
  group_id uuid references attribute_groups (id) on delete set null,
  options  jsonb,            -- for select / multiselect
  required boolean not null default false
);

create table attribute_values (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products (id) on delete cascade,
  attribute_id uuid not null references attribute_definitions (id) on delete cascade,
  value        jsonb,        -- accommodates every attribute type
  unique (product_id, attribute_id)
);

-- ─────────────────────────────────────────────────────────────
-- Variants — purchasable variations of a product
-- ─────────────────────────────────────────────────────────────
create table variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  sku        text not null unique,
  options    jsonb not null default '{}'::jsonb,  -- e.g. {"size":"L","color":"red"}
  price      numeric(12, 2)
);

-- ─────────────────────────────────────────────────────────────
-- Media — files stored in Supabase Storage
-- ─────────────────────────────────────────────────────────────
create table media_assets (
  id          uuid primary key default gen_random_uuid(),
  bucket_path text not null,
  url         text not null,
  mime_type   text not null,
  size_bytes  bigint not null default 0,
  alt         text,
  created_at  timestamptz not null default now()
);

create table product_media (
  product_id uuid not null references products (id) on delete cascade,
  media_id   uuid not null references media_assets (id) on delete cascade,
  position   int not null default 0,
  primary key (product_id, media_id)
);

-- Helpful indexes for common lookups
create index idx_product_categories_category on product_categories (category_id);
create index idx_attribute_values_product on attribute_values (product_id);
create index idx_variants_product on variants (product_id);
create index idx_product_media_product on product_media (product_id);
