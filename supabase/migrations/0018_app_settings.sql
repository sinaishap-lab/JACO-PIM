-- JACO-PIM — app settings (key/value) for integrations like iCount
-- Run in the Supabase SQL editor.

create table if not exists app_settings (
  key   text primary key,
  value text
);

alter table app_settings disable row level security;

notify pgrst, 'reload schema';
