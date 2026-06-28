import { createClient } from "@/lib/supabase/server";
import type { PaymentTerms, Supplier } from "@/lib/types";
import type { SupplierInput } from "@/lib/schemas/supplier";

/** Supplier service — CRUD over the `suppliers` table. */

interface SupplierRow {
  id: string;
  name: string;
  code: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  payment_terms: PaymentTerms | null;
  notes: string | null;
}

function toSupplier(row: SupplierRow): Supplier {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    website: row.website,
    paymentTerms: row.payment_terms,
    notes: row.notes,
  };
}

function toRow(input: SupplierInput) {
  return {
    name: input.name,
    code: input.code || null,
    contact_name: input.contactName || null,
    phone: input.phone || null,
    email: input.email || null,
    website: input.website || null,
    payment_terms: input.paymentTerms,
    notes: input.notes || null,
  };
}

export async function listSuppliers(): Promise<Supplier[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as SupplierRow[]).map(toSupplier);
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toSupplier(data as SupplierRow) : null;
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .insert(toRow(input))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return toSupplier(data as SupplierRow);
}

export async function updateSupplier(
  id: string,
  input: SupplierInput
): Promise<Supplier> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .update(toRow(input))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return toSupplier(data as SupplierRow);
}

export async function deleteSupplier(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
