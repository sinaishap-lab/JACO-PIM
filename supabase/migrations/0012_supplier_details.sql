-- JACO-PIM — supplier website/catalog link + payment terms
-- Run in the Supabase SQL editor.

alter table suppliers add column if not exists website text;
alter table suppliers add column if not exists payment_terms text
  check (payment_terms is null or payment_terms in ('prepaid', 'end_of_month'));

notify pgrst, 'reload schema';
