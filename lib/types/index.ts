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

/**
 * Whether a product is a sellable end product or a raw material/component.
 * - finished: sold to customers, has a sale price; its cost is computed from
 *   the raw materials it is made of (see {@link ProductComponent}).
 * - raw_material: not sold as-is, has a (purchase) cost price.
 */
export type ProductType = "finished" | "raw_material";

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
  /** Auto-generated; null until the product has the parts to build one. */
  sku: string | null;
  name: string;
  description: string | null;
  status: ProductStatus;
  type: ProductType;
  /** Purchase cost (raw materials). For finished products this is computed. */
  costPrice: number | null;
  /** Selling price (finished products). */
  salePrice: number | null;
  /** Raw materials: what you buy (e.g. "גליל", "פלטה"). */
  packUnit: string | null;
  /** Raw materials: usage units contained in one package (e.g. 50). */
  contentAmount: number | null;
  /** Raw materials: how it is consumed (e.g. "מטר", 'מ"ר'). */
  usageUnit: string | null;
  /** Classification (all optional). */
  departmentId: string | null;
  subDepartmentId: string | null;
  modelId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A raw material used to make a finished product, with its quantity. */
export interface ProductComponent {
  id: string;
  productId: string;
  componentId: string;
  quantity: number;
}

/** A vendor that supplies products or raw materials. */
export interface Supplier {
  id: string;
  name: string;
  /** Short code (English) used as the SKU prefix, e.g. "DH". */
  code: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

/** A product's link to one of its suppliers, with that supplier's terms. */
export interface ProductSupplier {
  id: string;
  productId: string;
  supplierId: string;
  supplierSku: string | null;
  supplierName: string | null;
  costPrice: number | null;
  isPreferred: boolean;
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
