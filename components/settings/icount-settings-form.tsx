"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveIcountSettingsAction,
  type SettingsState,
} from "@/app/(dashboard)/settings/actions";

export function IcountSettingsForm({
  cid,
  user,
  hasPass,
}: {
  cid: string;
  user: string;
  hasPass: boolean;
}) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveIcountSettingsAction,
    {}
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      {state.error && (
        <div className="border-destructive/50 text-destructive rounded-md border px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="icount_cid">מזהה חברה (CID)</Label>
        <Input id="icount_cid" name="icount_cid" defaultValue={cid} dir="ltr" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icount_user">שם משתמש API</Label>
        <Input id="icount_user" name="icount_user" defaultValue={user} dir="ltr" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icount_pass">סיסמת API</Label>
        <Input
          id="icount_pass"
          name="icount_pass"
          type="password"
          dir="ltr"
          placeholder={hasPass ? "•••••••• (שמורה — מלא רק כדי לשנות)" : ""}
        />
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
