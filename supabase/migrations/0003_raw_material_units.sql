-- JACO-PIM — units of measure for raw materials
-- Apply after 0002. Run in the Supabase SQL editor or `supabase db push`.
--
-- Raw materials are bought as a package (roll / sheet) but consumed per unit
-- (meter / m²). These columns let the app compute a per-unit cost:
--   unit cost = cost_price / content_amount   (₪ per usage_unit)
--
--   cost_price     → price of one package (already exists; reused as "package price")
--   pack_unit      → what you buy: "גליל", "פלטה", "אריזה"
--   content_amount → how many usage units are in one package (e.g. 50)
--   usage_unit     → how it is consumed: "מטר", "מ\"ר", "יחידה"

alter table products
  add column pack_unit text,
  add column content_amount numeric(12, 4) check (content_amount is null or content_amount > 0),
  add column usage_unit text;
