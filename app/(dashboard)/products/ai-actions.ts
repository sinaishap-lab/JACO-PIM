"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { generateProductPhoto } from "@/lib/ai/product-photo";

export type AiPhotoState = { url?: string; error?: string };

const BUCKET = "product-images";

/**
 * Restyles a phone photo into a professional product image (white background +
 * shadow) via Gemini, stores the result in Storage, and returns its public URL.
 */
export async function enhanceProductPhotoAction(input: {
  base64: string;
  mimeType: string;
}): Promise<AiPhotoState> {
  try {
    const out = await generateProductPhoto(input.base64, input.mimeType);
    const supabase = createAdminClient();
    const ext = out.mimeType.includes("jpeg") ? "jpg" : "png";
    const path = `ai/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(out.base64, "base64");
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: out.mimeType, upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "שגיאה בעיצוב התמונה",
    };
  }
}
