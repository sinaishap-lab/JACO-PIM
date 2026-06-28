import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ClipboardList } from "lucide-react";

import { SupplierForm } from "@/components/suppliers/supplier-form";
import { DeleteSupplierButton } from "@/components/suppliers/delete-supplier-button";
import { Button } from "@/components/ui/button";
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
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/suppliers/${supplier.id}/order`}>
              <ClipboardList />
              טופס הזמנה
            </Link>
          </Button>
          <DeleteSupplierButton id={supplier.id} name={supplier.name} />
        </div>
      </header>

      <SupplierForm action={action} supplier={supplier} />
    </div>
  );
}
