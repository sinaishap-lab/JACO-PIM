-- JACO-PIM — product variants: size options (with price) and color options
-- Apply after 0006. Run in the Supabase SQL editor or `supabase db push`.
--
-- A finished product can have size options (each with its own price) and color
-- options (each with an English letter). The sellable variants are the
-- size × color combinations; each variant's SKU is built from the size value
-- and the color letter (see the SKU generator).

create table product_sizes (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  value      text not null,            -- e.g. "10.15"
  price      numeric(12, 2),
  unique (product_id, value)
);

create table product_colors (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  value      text not null,            -- e.g. "אדום"
  letter     text,                     -- English letter for the SKU, e.g. "R"
  unique (product_id, value)
);

create index idx_product_sizes_product on product_sizes (product_id);
create index idx_product_colors_product on product_colors (product_id);
