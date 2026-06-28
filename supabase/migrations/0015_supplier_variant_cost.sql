-- JACO-PIM — per-variant supplier cost price
-- Run in the Supabase SQL editor.
--
-- Each supplier can charge a different cost for each size × color variant. The
-- sell price stays per size (product_sizes.price); the buy/cost price is per
-- supplier per variant, alongside the supplier's SKU.

alter table supplier_variant_skus
  add column if not exists cost_price numeric(12, 2);

-- The SKU may now be empty when only a cost is entered.
alter table supplier_variant_skus alter column sku set default '';

notify pgrst, 'reload schema';
