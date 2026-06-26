import { z } from "zod";

/** Validation for a supplier (vendor) record. */
export const supplierInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "שם הספק הוא שדה חובה")
    .max(120, "שם ארוך מדי"),
  contactName: z.string().trim().max(120).nullable(),
  phone: z.string().trim().max(40).nullable(),
  email: z
    .union([z.literal(""), z.string().trim().email("אימייל לא תקין")])
    .nullable(),
  notes: z.string().trim().max(2000).nullable(),
});

export type SupplierInput = z.infer<typeof supplierInputSchema>;
