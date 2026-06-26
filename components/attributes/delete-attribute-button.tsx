"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteAttributeAction } from "@/app/(dashboard)/attributes/actions";

export function DeleteAttributeButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `למחוק את המאפיין "${label}"? הערכים שלו במוצרים יימחקו גם. פעולה זו אינה הפיכה.`
      )
    )
      return;
    startTransition(() => {
      void deleteAttributeAction(id);
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleDelete}
      disabled={pending}
    >
      <Trash2 />
      {pending ? "מוחק…" : "מחק מאפיין"}
    </Button>
  );
}
