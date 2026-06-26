"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/app/(dashboard)/products/actions";

export function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`למחוק את המוצר "${name}"? פעולה זו אינה הפיכה.`)) return;
    startTransition(() => {
      void deleteProductAction(id);
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
      {pending ? "מוחק…" : "מחק מוצר"}
    </Button>
  );
}
