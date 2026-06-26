import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { AttributeForm } from "@/components/attributes/attribute-form";
import { DeleteAttributeButton } from "@/components/attributes/delete-attribute-button";
import { getAttribute } from "@/lib/services/attribute.service";
import { updateAttributeAction } from "../actions";

export default async function EditAttributePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const attribute = await getAttribute(id);

  if (!attribute) {
    notFound();
  }

  const action = updateAttributeAction.bind(null, id);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/attributes"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowRight className="size-4" />
            חזרה למאפיינים
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {attribute.label}
          </h1>
        </div>
        <DeleteAttributeButton id={attribute.id} label={attribute.label} />
      </header>

      <AttributeForm action={action} attribute={attribute} />
    </div>
  );
}
