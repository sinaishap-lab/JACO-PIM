"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { productInputSchema } from "@/lib/schemas/product";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/services/product.service";

/** Result returned to the form via useActionState. */
export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function parse(formData: FormData) {
  return productInputSchema.safeParse({
    sku: formData.get("sku"),
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
  });
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  try {
    await createProduct(parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "שגיאה ביצירת המוצר" };
  }
  revalidatePath("/products");
  redirect("/products");
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  try {
    await updateProduct(id, parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "שגיאה בעדכון המוצר" };
  }
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect("/products");
}

export async function deleteProductAction(id: string): Promise<void> {
  await deleteProduct(id);
  revalidatePath("/products");
  redirect("/products");
}
