"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveGoogleAiSettingsAction,
  type SettingsState,
} from "@/app/(dashboard)/settings/actions";

export function GoogleAiSettingsForm({ hasKey }: { hasKey: boolean }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveGoogleAiSettingsAction,
    {}
  );

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {state.error && (
        <div className="border-destructive/50 text-destructive rounded-md border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="google_ai_key">מפתח Google AI (Gemini)</Label>
        <Input
          id="google_ai_key"
          name="google_ai_key"
          type="password"
          dir="ltr"
          placeholder={
            hasKey ? "•••••••• (שמור — מלא רק כדי לשנות)" : "הדביקו כאן את המפתח"
          }
        />
        <p className="text-muted-foreground text-xs">
          ב-Google AI Studio (aistudio.google.com) → Get API key. משמש לכלי
          &quot;צילום → תמונת מוצר&quot; בעמוד המוצר.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "שומר…" : "שמירת הגדרות"}
        </Button>
        {state.ok && (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
            <Check className="size-4" />
            נשמר
          </span>
        )}
      </div>
    </form>
  );
}
