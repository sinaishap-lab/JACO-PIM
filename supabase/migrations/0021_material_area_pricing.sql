-- Area-based pricing for raw materials that come as a sheet (plate) or a roll,
-- so the cost of a cut size can be derived automatically.
--   material_form: 'simple' (per usage unit, existing) | 'sheet' | 'roll'
--   sheet_width_cm / sheet_height_cm: sheet dimensions; for 'roll' only the
--     width is used (height is the running length, priced per meter).
--   For 'sheet', cost_price = full sheet price. For 'roll', cost_price = price
--     per running meter. waste_percent is added to the computed area cost.

alter table products
  add column if not exists material_form text not null default 'simple',
  add column if not exists sheet_width_cm numeric,
  add column if not exists sheet_height_cm numeric,
  add column if not exists waste_percent numeric not null default 0;
