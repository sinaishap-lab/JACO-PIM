import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductForm } from "@/components/products/product-form";
import { createProductAction } from "../actions";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link
          href="/products"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowRight className="size-4" />
          חזרה למוצרים
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">מוצר חדש</h1>
        <p className="text-muted-foreground">הוספת מוצר לקטלוג</p>
      </header>

      <ProductForm action={createProductAction} />
    </div>
  );
}
