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
    const raw = err instanceof Error ? err.message : "שגיאה בעיצוב התמונה";
    // Translate Google's long quota/billing error into a clear, actionable note.
    if (/quota|billing|free_tier|limit: 0|RESOURCE_EXHAUSTED/i.test(raw)) {
      return {
        error:
          "מכסת ה-AI חרגה: מודל התמונות של Gemini אינו זמין בחינם. יש להפעיל " +
          "חיוב (Billing) בפרויקט Google Cloud של מפתח ה-API ולנסות שוב.",
      };
    }
    return { error: raw };
  }
}
