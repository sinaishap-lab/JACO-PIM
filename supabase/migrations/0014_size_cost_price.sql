-- JACO-PIM — per-size cost price
-- Run in the Supabase SQL editor.
--
-- A product with size variants can have a different BUY price (cost) as well as
-- a different SELL price for each size. product_sizes.price already holds the
-- sell price; this adds the buy price.

alter table product_sizes
  add column if not exists cost_price numeric(12, 2);

notify pgrst, 'reload schema';
