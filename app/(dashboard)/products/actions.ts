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
import { listAttributes } from "@/lib/services/attribute.service";
import { setProductAttributeValues } from "@/lib/services/attribute-value.service";

/** Result returned to the form via useActionState. */
export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

/** Result of saving a product's dynamic attribute values. */
export type AttributeValuesState = { ok?: boolean; error?: string };

/**
 * Saves the dynamic attribute values for a product. Reads the attribute
 * definitions to coerce each form field by its type before storing.
 */
export async function saveProductAttributesAction(
  productId: string,
  _prev: AttributeValuesState,
  formData: FormData
): Promise<AttributeValuesState> {
  try {
    const attributes = await listAttributes();
    const values: Record<string, unknown> = {};

    for (const attr of attributes) {
      const field = `attr_${attr.id}`;
      const raw = formData.get(field);
      switch (attr.type) {
        case "number": {
          const num = typeof raw === "string" && raw.trim() ? Number(raw) : null;
          values[attr.id] = num === null || Number.isNaN(num) ? null : num;
          break;
        }
        case "boolean":
          values[attr.id] = raw === "on";
          break;
        default:
          values[attr.id] =
            typeof raw === "string" && raw.trim() ? raw.trim() : null;
      }
    }

    await setProductAttributeValues(productId, values);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "שגיאה בשמירת המאפיינים",
    };
  }

  revalidatePath(`/products/${productId}`);
  return { ok: true };
}

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
