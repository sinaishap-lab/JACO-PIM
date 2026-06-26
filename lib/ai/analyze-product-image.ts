import Anthropic from "@anthropic-ai/sdk";

/**
 * Product information extracted from a photo by Claude's vision capability.
 * All text is in Hebrew, ready to drop into the product form.
 */
export type ProductImageAnalysis = {
  name: string;
  description: string;
  category: string;
  attributes: string[];
};

const SYSTEM_PROMPT = `אתה עוזר מומחה לקטלוג מוצרים בעברית עבור מערכת PIM.
מקבלים תמונה של מוצר, ועליך להפיק ממנה מידע מסחרי מדויק וברור בעברית.
- שם מוצר: קצר, ברור ומסחרי.
- תיאור: 2-3 משפטים שיווקיים שמתארים את המוצר ותועלותיו.
- קטגוריה: קטגוריה אחת מתאימה.
- מאפיינים: רשימת מאפיינים בולטים (צבע, חומר, גודל, כמות וכו') כפריטי טקסט קצרים.
אם פרט אינו ודאי, תן את ההערכה הסבירה ביותר ואל תמציא מפרט טכני מזויף.`;

export async function analyzeProductImage(
  base64: string,
  mediaType: string
): Promise<ProductImageAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY חסר — הוסיפו אותו ל-.env.local כדי להפעיל ניתוח תמונות"
    );
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: "save_product_info",
        description: "שמירת המידע שחולץ מתמונת המוצר",
        input_schema: {
          type: "object",
          properties: {
            name: { type: "string", description: "שם מוצר קצר וברור בעברית" },
            description: {
              type: "string",
              description: "תיאור שיווקי קצר בעברית (2-3 משפטים)",
            },
            category: {
              type: "string",
              description: "קטגוריה מוצעת אחת בעברית",
            },
            attributes: {
              type: "array",
              items: { type: "string" },
              description: "מאפיינים בולטים כטקסט קצר (צבע, חומר, גודל…)",
            },
          },
          required: ["name", "description", "category", "attributes"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "save_product_info" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/webp",
              data: base64,
            },
          },
          {
            type: "text",
            text: "נתח את המוצר שבתמונה והפק שם, תיאור שיווקי, קטגוריה ומאפיינים — הכל בעברית.",
          },
        ],
      },
    ],
  });

  const block = message.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("לא התקבל מידע מהניתוח");
  }

  return block.input as ProductImageAnalysis;
}
