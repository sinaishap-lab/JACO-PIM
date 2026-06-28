"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { supplierInputSchema } from "@/lib/schemas/supplier";
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/lib/services/supplier.service";

export type SupplierFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function text(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parse(formData: FormData) {
  return supplierInputSchema.safeParse({
    name: formData.get("name"),
    code: text(formData.get("code")),
    contactName: text(formData.get("contactName")) ?? "",
    phone: text(formData.get("phone")) ?? "",
    email: text(formData.get("email")),
    website: text(formData.get("website")),
    paymentTerms: text(formData.get("paymentTerms")),
    notes: text(formData.get("notes")),
  });
}

export async function createSupplierAction(
  _prev: SupplierFormState,
  formData: FormData
): Promise<SupplierFormState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  try {
    await createSupplier(parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "שגיאה ביצירת הספק" };
  }
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function updateSupplierAction(
  id: string,
  _prev: SupplierFormState,
  formData: FormData
): Promise<SupplierFormState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  try {
    await updateSupplier(id, parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "שגיאה בעדכון הספק" };
  }
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function deleteSupplierAction(id: string): Promise<void> {
  await deleteSupplier(id);
  revalidatePath("/suppliers");
  redirect("/suppliers");
}
