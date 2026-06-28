import { getSettings } from "@/lib/services/settings.service";
import { IcountSettingsForm } from "@/components/settings/icount-settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let cid = "";
  let user = "";
  let hasPass = false;
  let hasToken = false;
  try {
    const s = await getSettings([
      "icount_token",
      "icount_cid",
      "icount_user",
      "icount_pass",
    ]);
    cid = s.icount_cid ?? "";
    user = s.icount_user ?? "";
    hasPass = Boolean(s.icount_pass || process.env.ICOUNT_PASS);
    hasToken = Boolean(s.icount_token || process.env.ICOUNT_TOKEN);
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
    </div>
  );
}
