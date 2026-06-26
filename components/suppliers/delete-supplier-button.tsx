"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteSupplierAction } from "@/app/(dashboard)/suppliers/actions";

export function DeleteSupplierButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `למחוק את הספק "${name}"? הקישורים שלו למוצרים יימחקו גם. פעולה זו אינה הפיכה.`
      )
    )
      return;
    startTransition(() => {
      void deleteSupplierAction(id);
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
      {pending ? "מוחק…" : "מחק ספק"}
    </Button>
  );
}
