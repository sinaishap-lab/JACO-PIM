-- JACO-PIM — standard (fixed) optional product fields
-- Run in the Supabase SQL editor.
--
-- Replaces free-form attribute creation with a fixed catalog of optional fields
-- (one list, supplier/internal side). They are stored as attribute_definitions
-- rows with stable keys; the management UI is removed, so the catalog is fixed.
-- Add more fields later by inserting additional rows here.

insert into attribute_definitions (key, label, type, audience, options, required)
values
  ('std_volume',          'נפח',          'number', 'supplier', null, false),
  ('std_material',        'חומר',         'text',   'supplier', null, false),
  ('std_print_technique', 'טכניקת דפוס',  'text',   'supplier', null, false)
on conflict (key) do nothing;

notify pgrst, 'reload schema';
