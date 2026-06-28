import "server-only";

import { getSettings } from "@/lib/services/settings.service";

/**
 * Turns a casual phone photo into a clean e-commerce product shot using
 * Google's Gemini image model ("nano banana"). The API key is read from app
 * settings (`google_ai_key`) or the GOOGLE_AI_API_KEY env var.
 */

const MODEL = "gemini-2.5-flash-image";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const PROMPT = [
  "Turn this into a professional e-commerce product photograph.",
  "Cleanly remove the original background and any clutter, and place the",
  "product on a pure white (#FFFFFF) background, centered, with soft studio",
  "lighting and a natural soft drop shadow beneath it.",
  "Keep the product's real colors, shape, text and details exactly as they are.",
  "Do not add or remove parts of the product. Output only the edited image.",
].join(" ");

export async function isProductPhotoConfigured(): Promise<boolean> {
  const s = await getSettings(["google_ai_key"]);
  return Boolean(s.google_ai_key || process.env.GOOGLE_AI_API_KEY);
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

/** Calls Gemini to restyle the given image; returns the generated image. */
export async function generateProductPhoto(
  base64: string,
  mimeType: string
): Promise<GeneratedImage> {
  const s = await getSettings(["google_ai_key"]);
  const key = s.google_ai_key || process.env.GOOGLE_AI_API_KEY || "";
  if (!key) {
    throw new Error("מפתח Google AI לא הוגדר — הזינו אותו במסך ההגדרות");
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    cache: "no-store",
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: PROMPT },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
    }),
  });

  const json = (await res.json().catch(() => null)) as {
    candidates?: {
      content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] };
    }[];
    error?: { message?: string };
  } | null;

  if (!res.ok || !json) {
    throw new Error(json?.error?.message || `Gemini error (${res.status})`);
  }

  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const image = parts.find((p) => p.inlineData?.data)?.inlineData;
  if (!image?.data) {
    throw new Error("ה-AI לא החזיר תמונה — נסו תמונה אחרת");
  }
  return { base64: image.data, mimeType: image.mimeType || "image/png" };
}
