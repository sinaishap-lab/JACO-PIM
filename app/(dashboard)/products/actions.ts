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
import {
  addComponent,
  removeComponent,
} from "@/lib/services/component.service";
import {
  addProductSupplier,
  removeProductSupplier,
  setPreferredSupplier,
} from "@/lib/services/product-supplier.service";
import {
  addSize,
  removeSize,
  addColor,
  removeColor,
} from "@/lib/services/variant.service";
import { regenerateProductSku } from "@/lib/services/sku.service";
import { setSupplierVariantSkus } from "@/lib/services/supplier-variant-sku.service";

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
  audience: "supplier" | "customer",
  _prev: AttributeValuesState,
  formData: FormData
): Promise<AttributeValuesState> {
  try {
    // Only the attributes of this section's audience appear in the form, so we
    // scope the write to them — otherwise saving one section would wipe the
    // other section's values.
    const attributes = (await listAttributes()).filter(
      (a) => a.audience === audience
    );
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
        case "multiselect": {
          const picked = formData
            .getAll(field)
            .filter((v): v is string => typeof v === "string" && v.trim() !== "");
          values[attr.id] = picked.length ? picked : null;
          break;
        }
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

function toPrice(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toText(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parse(formData: FormData) {
  return productInputSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    // Status is no longer chosen in the form — a saved product is active.
    status: formData.get("status") ?? "published",
    type: formData.get("type"),
    costPrice: toPrice(formData.get("costPrice")),
    salePrice: toPrice(formData.get("salePrice")),
    packUnit: toText(formData.get("packUnit")),
    contentAmount: toPrice(formData.get("contentAmount")),
    usageUnit: toText(formData.get("usageUnit")),
    departmentId: toText(formData.get("departmentId")),
    subDepartmentId: toText(formData.get("subDepartmentId")),
    modelId: toText(formData.get("modelId")),
  });
}

// ── Helpers for the unified create form ─────────────────────────────────────

function parseJsonArray(
  value: FormDataEntryValue | null
): Record<string, unknown>[] {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const v = JSON.parse(value);
    return Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

function strOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function numOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** Reads all dynamic attribute values (both audiences) from the form. */
async function readAttributeValues(
  formData: FormData
): Promise<Record<string, unknown>> {
  const attributes = await listAttributes();
  const values: Record<string, unknown> = {};
  for (const attr of attributes) {
    const field = `attr_${attr.id}`;
    switch (attr.type) {
      case "number": {
        const raw = formData.get(field);
        const num = typeof raw === "string" && raw.trim() ? Number(raw) : null;
        values[attr.id] = num === null || Number.isNaN(num) ? null : num;
        break;
      }
      case "boolean":
        values[attr.id] = formData.get(field) === "on";
        break;
      case "multiselect": {
        const picked = formData
          .getAll(field)
          .filter((v): v is string => typeof v === "string" && v.trim() !== "");
        values[attr.id] = picked.length ? picked : null;
        break;
      }
      default: {
        const raw = formData.get(field);
        values[attr.id] =
          typeof raw === "string" && raw.trim() ? raw.trim() : null;
      }
    }
  }
  return values;
}

/**
 * Creates a product together with all its related data in one submit:
 * suppliers, sizes, colors, recipe, per-variant supplier SKUs and attributes.
 */
export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  let productId = "";
  try {
    const product = await createProduct(parsed.data);
    productId = product.id;

    // Suppliers
    for (const s of parseJsonArray(formData.get("suppliers"))) {
      const supplierId = strOrNull(s.supplierId);
      if (!supplierId) continue;
      await addProductSupplier(productId, {
        supplierId,
        supplierSku: strOrNull(s.supplierSku),
        supplierName: strOrNull(s.supplierName),
        costPrice: numOrNull(s.costPrice),
        isPreferred: Boolean(s.isPreferred),
      });
    }

    // Sizes (each with its own sell + buy price)
    for (const sz of parseJsonArray(formData.get("sizes"))) {
      const value = strOrNull(sz.value);
      if (value) {
        await addSize(
          productId,
          value,
          numOrNull(sz.price),
          numOrNull(sz.costPrice)
        );
      }
    }

    // Colors
    for (const c of parseJsonArray(formData.get("colors"))) {
      const value = strOrNull(c.value);
      if (!value) continue;
      const letterRaw = strOrNull(c.letter);
      await addColor(
        productId,
        value,
        letterRaw ? letterRaw.slice(0, 3).toUpperCase() : null
      );
    }

    // Recipe (BOM)
    for (const cmp of parseJsonArray(formData.get("components"))) {
      const componentId = strOrNull(cmp.componentId);
      const quantity = numOrNull(cmp.quantity);
      if (componentId && quantity && quantity > 0) {
        await addComponent(productId, componentId, quantity);
      }
    }

    // Per-variant supplier SKUs + cost (grouped by supplier)
    const bySupplier = new Map<
      string,
      {
        size: string | null;
        color: string | null;
        sku: string | null;
        cost: number | null;
      }[]
    >();
    for (const v of parseJsonArray(formData.get("variantSkus"))) {
      const supplierId = strOrNull(v.supplierId);
      const sku = strOrNull(v.sku);
      const cost = numOrNull(v.cost);
      if (!supplierId || (!sku && cost == null)) continue;
      const arr = bySupplier.get(supplierId) ?? [];
      arr.push({
        size: strOrNull(v.size),
        color: strOrNull(v.color),
        sku,
        cost,
      });
      bySupplier.set(supplierId, arr);
    }
    for (const [sid, entries] of bySupplier) {
      await setSupplierVariantSkus(productId, sid, entries);
    }

    // Attributes
    await setProductAttributeValues(productId, await readAttributeValues(formData));

    await regenerateProductSku(productId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "שגיאה ביצירת המוצר" };
  }
  revalidatePath("/products");
  redirect(`/products/${productId}`);
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
    await regenerateProductSku(id);
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

// ── Bill of materials (recipe) ──────────────────────────────────────────────

export async function addComponentAction(
  productId: string,
  formData: FormData
): Promise<void> {
  const componentId = formData.get("componentId");
  const quantity = Number(formData.get("quantity"));
  if (typeof componentId === "string" && componentId && quantity > 0) {
    await addComponent(productId, componentId, quantity);
    revalidatePath(`/products/${productId}`);
  }
}

export async function removeComponentAction(
  productId: string,
  componentId: string
): Promise<void> {
  await removeComponent(productId, componentId);
  revalidatePath(`/products/${productId}`);
}

// ── Suppliers of a product ──────────────────────────────────────────────────

export async function addProductSupplierAction(
  productId: string,
  formData: FormData
): Promise<void> {
  const supplierId = formData.get("supplierId");
  if (typeof supplierId !== "string" || !supplierId) return;
  await addProductSupplier(productId, {
    supplierId,
    supplierSku: toText(formData.get("supplierSku")),
    supplierName: toText(formData.get("supplierName")),
    costPrice: toPrice(formData.get("costPrice")),
    isPreferred: formData.get("isPreferred") === "on",
  });
  await regenerateProductSku(productId);
  revalidatePath(`/products/${productId}`);
}

export async function removeProductSupplierAction(
  productId: string,
  rowId: string
): Promise<void> {
  await removeProductSupplier(rowId);
  await regenerateProductSku(productId);
  revalidatePath(`/products/${productId}`);
}

export async function setPreferredSupplierAction(
  productId: string,
  supplierId: string
): Promise<void> {
  await setPreferredSupplier(productId, supplierId);
  await regenerateProductSku(productId);
  revalidatePath(`/products/${productId}`);
}

export async function saveSupplierVariantSkusAction(
  productId: string,
  supplierId: string,
  formData: FormData
): Promise<void> {
  const entries: {
    size: string | null;
    color: string | null;
    sku: string | null;
    cost: number | null;
  }[] = [];
  const count = Number(formData.get("count")) || 0;
  for (let i = 0; i < count; i++) {
    entries.push({
      size: toText(formData.get(`size_${i}`)),
      color: toText(formData.get(`color_${i}`)),
      sku: toText(formData.get(`sku_${i}`)),
      cost: toPrice(formData.get(`cost_${i}`)),
    });
  }
  await setSupplierVariantSkus(productId, supplierId, entries);
  revalidatePath(`/products/${productId}`);
}

// ── Variants (sizes & colors) ───────────────────────────────────────────────

export async function addSizeAction(
  productId: string,
  formData: FormData
): Promise<void> {
  const value = toText(formData.get("value"));
  if (!value) return;
  await addSize(
    productId,
    value,
    toPrice(formData.get("price")),
    toPrice(formData.get("costPrice"))
  );
  revalidatePath(`/products/${productId}`);
}

export async function removeSizeAction(
  productId: string,
  id: string
): Promise<void> {
  await removeSize(id);
  revalidatePath(`/products/${productId}`);
}

export async function addColorAction(
  productId: string,
  formData: FormData
): Promise<void> {
  const value = toText(formData.get("value"));
  if (!value) return;
  const letterRaw = toText(formData.get("letter"));
  const letter = letterRaw ? letterRaw.slice(0, 3).toUpperCase() : null;
  await addColor(productId, value, letter);
  revalidatePath(`/products/${productId}`);
}

export async function removeColorAction(
  productId: string,
  id: string
): Promise<void> {
  await removeColor(id);
  revalidatePath(`/products/${productId}`);
}
