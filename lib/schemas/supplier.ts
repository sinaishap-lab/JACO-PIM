import { z } from "zod";

/** Payment-term options offered for a supplier. */
export const paymentTermsSchema = z.enum(["prepaid", "end_of_month"]);

export const paymentTermsLabels: Record<
  z.infer<typeof paymentTermsSchema>,
  string
> = {
  prepaid: "תשלום מראש",
  end_of_month: "תשלום סוף חודש",
};

/** Validation for a supplier (vendor) record. */
export const supplierInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "שם הספק הוא שדה חובה")
    .max(120, "שם ארוך מדי"),
  code: z.string().trim().max(10, "קוד קצר מדי עדיף").nullable(),
  // Contact name and phone are required.
  contactName: z
    .string()
    .trim()
    .min(1, "שם איש קשר הוא שדה חובה")
    .max(120, "שם ארוך מדי"),
  phone: z
    .string()
    .trim()
    .min(1, "טלפון הוא שדה חובה")
    .max(40, "מספר ארוך מדי"),
  email: z
    .union([z.literal(""), z.string().trim().email("אימייל לא תקין")])
    .nullable(),
  website: z
    .union([z.literal(""), z.string().trim().url("כתובת אתר לא תקינה")])
    .nullable(),
  paymentTerms: paymentTermsSchema.nullable(),
  notes: z.string().trim().max(2000).nullable(),
});

export type SupplierInput = z.infer<typeof supplierInputSchema>;
