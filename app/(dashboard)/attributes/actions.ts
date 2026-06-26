"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { attributeInputSchema } from "@/lib/schemas/attribute";
import {
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from "@/lib/services/attribute.service";

export type AttributeFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function parse(formData: FormData) {
  const optionsRaw = formData.get("options");
  const options =
    typeof optionsRaw === "string" && optionsRaw.trim()
      ? optionsRaw
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

  return attributeInputSchema.safeParse({
    label: formData.get("label"),
    type: formData.get("type"),
    options,
    required: formData.get("required") === "on",
  });
}

export async function createAttributeAction(
  _prev: AttributeFormState,
  formData: FormData
): Promise<AttributeFormState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  try {
    await createAttribute(parsed.data);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "שגיאה ביצירת המאפיין",
    };
  }
  revalidatePath("/attributes");
  redirect("/attributes");
}

export async function updateAttributeAction(
  id: string,
  _prev: AttributeFormState,
  formData: FormData
): Promise<AttributeFormState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  try {
    await updateAttribute(id, parsed.data);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "שגיאה בעדכון המאפיין",
    };
  }
  revalidatePath("/attributes");
  redirect("/attributes");
}

export async function deleteAttributeAction(id: string): Promise<void> {
  await deleteAttribute(id);
  revalidatePath("/attributes");
  redirect("/attributes");
}
