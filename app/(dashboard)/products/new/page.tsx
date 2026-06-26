import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { NewProductFlow } from "@/components/products/new-product-flow";

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
        <p className="text-muted-foreground">צלמו את המוצר או מלאו ידנית</p>
      </header>

      <NewProductFlow />
    </div>
  );
}
