-- Atomic allocation of the per-department running product number, to avoid two
-- concurrent product saves getting the same number (duplicate SKU). A
-- transaction-scoped advisory lock serializes allocation per department.

create or replace function next_product_number(p_department_id uuid)
returns integer
language plpgsql
as $$
declare
  n integer;
begin
  if p_department_id is null then
    return null;
  end if;
  -- Hold a lock keyed by the department for the duration of this transaction.
  perform pg_advisory_xact_lock(hashtext(p_department_id::text));
  select coalesce(max(product_number), 0) + 1
    into n
    from products
   where department_id = p_department_id;
  return n;
end;
$$;
