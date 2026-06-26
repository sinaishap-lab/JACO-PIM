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
import {
  uploadProductImage,
  linkProductMedia,
} from "@/lib/services/media.service";
import {
  analyzeProductImage,
  type ProductImageAnalysis,
} from "@/lib/ai/analyze-product-image";

/** Result returned to the form via useActionState. */
export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

/** Result of analyzing an uploaded product photo. */
export type AnalyzeImageResult =
  | ({ ok: true; mediaId: string; url: string } & ProductImageAnalysis)
  | { ok: false; error: string };

/**
 * Receives a product photo, runs it through Claude vision to generate product
 * info, and stores the image in Supabase Storage. Called from the client when
 * the employee snaps a photo.
 */
export async function analyzeImageAction(
  formData: FormData
): Promise<AnalyzeImageResult> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "לא נמצאה תמונה" };
  }
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "image/jpeg";
    const analysis = await analyzeProductImage(
      buffer.toString("base64"),
      contentType
    );
    const { mediaId, url } = await uploadProductImage(buffer, contentType);
    return { ok: true, mediaId, url, ...analysis };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה בניתוח התמונה",
    };
  }
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
    const product = await createProduct(parsed.data);
    const mediaId = formData.get("mediaId");
    if (typeof mediaId === "string" && mediaId) {
      await linkProductMedia(product.id, mediaId);
    }
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
