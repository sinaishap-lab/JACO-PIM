-- JACO-PIM — product classification: department → sub-department → model
-- Apply after 0004. Run in the Supabase SQL editor or `supabase db push`.
--
-- Each level has a code, used (with size + a running number) to generate SKUs.

create table departments (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  code text
);

create table sub_departments (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments (id) on delete cascade,
  name          text not null,
  code          text
);

create table models (
  id                uuid primary key default gen_random_uuid(),
  sub_department_id uuid not null references sub_departments (id) on delete cascade,
  name              text not null,
  code              text
);

create index idx_sub_departments_department on sub_departments (department_id);
create index idx_models_sub_department on models (sub_department_id);

-- Product references to its classification (all optional).
alter table products
  add column department_id     uuid references departments (id) on delete set null,
  add column sub_department_id uuid references sub_departments (id) on delete set null,
  add column model_id          uuid references models (id) on delete set null;
