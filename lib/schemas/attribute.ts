import { z } from "zod";

/**
 * Validation for attribute definitions — the "schema" of dynamic fields.
 * MVP supports a focused set of types; more (multiselect, rich_text) can be
 * added later without changing the data model.
 */

export const attributeTypeSchema = z.enum([
  "text",
  "number",
  "boolean",
  "select",
  "date",
]);

export type AttributeFormType = z.infer<typeof attributeTypeSchema>;

export const attributeAudienceSchema = z.enum(["supplier", "customer"]);

export type AttributeAudienceType = z.infer<typeof attributeAudienceSchema>;

export const attributeInputSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1, "שם המאפיין הוא שדה חובה")
      .max(100, "שם ארוך מדי"),
    type: attributeTypeSchema,
    audience: attributeAudienceSchema.default("supplier"),
    options: z.array(z.string().trim().min(1)).optional(),
    required: z.boolean(),
  })
  .refine(
    (v) => v.type !== "select" || (v.options && v.options.length > 0),
    { message: "למאפיין מסוג 'בחירה' צריך להגדיר לפחות אפשרות אחת", path: ["options"] }
  );

export type AttributeInput = z.infer<typeof attributeInputSchema>;

export const attributeTypeLabels: Record<AttributeFormType, string> = {
  text: "טקסט",
  number: "מספר",
  boolean: "כן / לא",
  select: "בחירה מרשימה",
  date: "תאריך",
};

export const attributeAudienceLabels: Record<AttributeAudienceType, string> = {
  supplier: "מאפייני ספק (פנימי)",
  customer: "מאפייני לקוח (שיווקי)",
};
