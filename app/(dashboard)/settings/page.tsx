import { getSettings } from "@/lib/services/settings.service";
import { IcountSettingsForm } from "@/components/settings/icount-settings-form";
import { GoogleAiSettingsForm } from "@/components/settings/google-ai-settings-form";
import { LabelSettingsForm } from "@/components/settings/label-settings-form";
import {
  parseLabelConfig,
  LABEL_CONFIG_KEY,
  DEFAULT_LABEL_CONFIG,
  type LabelConfig,
} from "@/lib/label-config";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let cid = "";
  let user = "";
  let hasPass = false;
  let hasToken = false;
  let hasGoogleAi = false;
  let labelConfig: LabelConfig = DEFAULT_LABEL_CONFIG;
  try {
    const s = await getSettings([
      "icount_token",
      "icount_cid",
      "icount_user",
      "icount_pass",
      "google_ai_key",
      LABEL_CONFIG_KEY,
    ]);
    cid = s.icount_cid ?? "";
    user = s.icount_user ?? "";
    hasPass = Boolean(s.icount_pass || process.env.ICOUNT_PASS);
    hasToken = Boolean(s.icount_token || process.env.ICOUNT_TOKEN);
    hasGoogleAi = Boolean(s.google_ai_key || process.env.GOOGLE_AI_API_KEY);
    labelConfig = parseLabelConfig(s[LABEL_CONFIG_KEY]);
  } catch {
    // settings table may not exist yet — show empty form.
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-brand-gradient w-fit">
          הגדרות
        </h1>
        <p className="text-muted-foreground">חיבורים חיצוניים</p>
      </header>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">iCount</h2>
          <p className="text-muted-foreground text-sm">
            פרטי ה-API מ-iCount (הגדרות → API). לאחר השמירה אפשר ללחוץ
            &quot;סנכרון ל-iCount&quot; בעמוד המוצרים.
          </p>
        </div>
        <IcountSettingsForm
          cid={cid}
          user={user}
          hasPass={hasPass}
          hasToken={hasToken}
        />
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Google AI (Gemini)</h2>
          <p className="text-muted-foreground text-sm">
            מפתח ל-AI שהופך צילום טלפון לתמונת מוצר מקצועית (רקע לבן + צל).
          </p>
        </div>
        <GoogleAiSettingsForm hasKey={hasGoogleAi} />
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">עיצוב מדבקת מוצר</h2>
          <p className="text-muted-foreground text-sm">
            מבנה וגודל המדבקה הקטנה (בהדפסה מעמוד המוצר). השינוי חל על כל המדבקות.
          </p>
        </div>
        <LabelSettingsForm config={labelConfig} />
      </section>
    </div>
  );
}

