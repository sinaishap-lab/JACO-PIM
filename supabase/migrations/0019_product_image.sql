-- Product images: a gallery per product (multiple images) with one marked as
-- the primary image. Files live in a public Storage bucket; this table holds
-- the URLs + which one is primary. Used for the A5 warehouse box label and
-- future catalog use.

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx
  on product_images(product_id);

alter table product_images disable row level security;

-- Public bucket so the stored image URL renders without auth (internal tool).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Permissive policies for this bucket (matches the project's open-access setup).
drop policy if exists "product-images read" on storage.objects;
create policy "product-images read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product-images insert" on storage.objects;
create policy "product-images insert" on storage.objects
  for insert with check (bucket_id = 'product-images');

drop policy if exists "product-images update" on storage.objects;
create policy "product-images update" on storage.objects
  for update using (bucket_id = 'product-images');

drop policy if exists "product-images delete" on storage.objects;
create policy "product-images delete" on storage.objects
  for delete using (bucket_id = 'product-images');
