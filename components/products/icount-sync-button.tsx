"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  syncIcountAction,
  probeIcountAction,
  type IcountSyncState,
} from "@/app/(dashboard)/products/icount-actions";

export function IcountSyncButton() {
  const [pending, start] = useTransition();
  const [state, setState] = useState<IcountSyncState>({});

  return (
    <div className="flex items-center gap-2">
      {state.message && (
        <span
          className={`text-sm whitespace-pre-line ${
            state.ok ? "text-muted-foreground" : "text-destructive"
          }`}
        >
          {state.message}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        title="אבחון iCount — בדיקת שמות המתודות"
        disabled={pending}
        onClick={() => start(async () => setState(await probeIcountAction()))}
      >
        <Stethoscope className={pending ? "animate-spin" : ""} />
      </Button>
      <Button
        variant="outline"
        disabled={pending}
        onClick={() => start(async () => setState(await syncIcountAction()))}
      >
        <RefreshCw className={pending ? "animate-spin" : ""} />
        סנכרון ל-iCount
      </Button>
    </div>
  );
}
