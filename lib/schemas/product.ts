import { z } from "zod";

/**
 * Validation schemas for product input. The same schema validates both the
 * form (client) and the Server Action (server) — a single source of truth.
 */

export const productStatusSchema = z.enum(["draft", "published", "archived"]);

export const productTypeSchema = z.enum(["finished", "raw_material"]);

/** A price field: optional, non-negative, null when blank. */
const priceField = z
  .number({ message: "מחיר חייב להיות מספר" })
  .min(0, "מחיר לא יכול להיות שלילי")
  .nullable();

export const productInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "שם המוצר הוא שדה חובה")
    .max(200, "שם המוצר ארוך מדי"),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  status: productStatusSchema.default("draft"),
  type: productTypeSchema.default("finished"),
  costPrice: priceField,
  salePrice: priceField,
  packUnit: z.string().trim().max(40).nullable(),
  contentAmount: z
    .number({ message: "כמות חייבת להיות מספר" })
    .positive("כמות חייבת להיות גדולה מ-0")
    .nullable(),
  usageUnit: z.string().trim().max(40).nullable(),
  departmentId: z.string().uuid().nullable(),
  subDepartmentId: z.string().uuid().nullable(),
  modelId: z.string().uuid().nullable(),
});

/** Common units a raw material can be consumed in. */
export const usageUnitOptions = [
  "יחידה",
  "מטר",
  'מ"ר',
  'ס"מ',
  'ק"ג',
  "גרם",
  "ליטר",
  'מ"ל',
];

/** Input accepted by create/update actions. */
export type ProductInput = z.infer<typeof productInputSchema>;

export const productTypeLabels: Record<
  z.infer<typeof productTypeSchema>,
  string
> = {
  finished: "מוצר קצה",
  raw_material: "חומר גלם",
};
