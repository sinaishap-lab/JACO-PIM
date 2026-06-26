/**
 * Core domain types for JACO-PIM.
 *
 * These hand-written types describe the shape the application works with.
 * Once a Supabase project is connected, generate row-level types with:
 *   npx supabase gen types typescript --linked > lib/types/database.ts
 * and map between the generated rows and these domain types in the services.
 */

/** Lifecycle state of a product record. */
export type ProductStatus = "draft" | "published" | "archived";

/** Data type a dynamic attribute can hold. */
export type AttributeType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "date"
  | "rich_text";

/** The master product record — the single source of truth. */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

/** A node in the category tree (self-referencing via parentId). */
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  position: number;
}

/** Definition (schema) of a dynamic attribute — the "shape", not the value. */
export interface AttributeDefinition {
  id: string;
  key: string;
  label: string;
  type: AttributeType;
  groupId: string | null;
  /** For select / multiselect types. */
  options: string[] | null;
  required: boolean;
}

/** A logical grouping of attribute definitions (e.g. "Dimensions"). */
export interface AttributeGroup {
  id: string;
  name: string;
  position: number;
}

/** The actual value of an attribute for a given product. */
export interface AttributeValue {
  id: string;
  productId: string;
  attributeId: string;
  /** Stored as JSON to accommodate every attribute type. */
  value: unknown;
}

/** A purchasable variant of a product (e.g. size L / color red). */
export interface Variant {
  id: string;
  productId: string;
  sku: string;
  /** Variant-defining options, e.g. { size: "L", color: "red" }. */
  options: Record<string, string>;
  price: number | null;
}

/** An uploaded file stored in Supabase Storage. */
export interface MediaAsset {
  id: string;
  bucketPath: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  alt: string | null;
}
