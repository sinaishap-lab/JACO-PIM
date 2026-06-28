import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SupplierForm } from "@/components/suppliers/supplier-form";
import { createSupplierAction } from "../actions";

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link
          href="/suppliers"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowRight className="size-4" />
          חזרה לספקים
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-brand-gradient w-fit">ספק חדש</h1>
        <p className="text-muted-foreground">הוספת ספק לרשימה</p>
      </header>

      <SupplierForm action={createSupplierAction} />
    </div>
  );
}
