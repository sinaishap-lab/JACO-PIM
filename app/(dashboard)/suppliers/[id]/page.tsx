import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { SupplierForm } from "@/components/suppliers/supplier-form";
import { DeleteSupplierButton } from "@/components/suppliers/delete-supplier-button";
import { getSupplier } from "@/lib/services/supplier.service";
import { updateSupplierAction } from "../actions";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplier(id);

  if (!supplier) {
    notFound();
  }

  const action = updateSupplierAction.bind(null, id);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/suppliers"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowRight className="size-4" />
            חזרה לספקים
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{supplier.name}</h1>
        </div>
        <DeleteSupplierButton id={supplier.id} name={supplier.name} />
      </header>

      <SupplierForm action={action} supplier={supplier} />
    </div>
  );
}
