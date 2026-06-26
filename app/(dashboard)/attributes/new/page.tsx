import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AttributeForm } from "@/components/attributes/attribute-form";
import { createAttributeAction } from "../actions";

export default function NewAttributePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link
          href="/attributes"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowRight className="size-4" />
          חזרה למאפיינים
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">מאפיין חדש</h1>
        <p className="text-muted-foreground">הגדרת שדה דינמי חדש למוצרים</p>
      </header>

      <AttributeForm action={createAttributeAction} />
    </div>
  );
}
