import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductForm } from "@/components/products/product-form";
import { createProductAction } from "../actions";
import { listClassificationTree } from "@/lib/services/classification.service";
import { listSuppliers } from "@/lib/services/supplier.service";
import type { ProductType } from "@/lib/types";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType: ProductType =
    type === "raw_material" ? "raw_material" : "finished";
  const isMaterial = initialType === "raw_material";
  const [tree, suppliers] = await Promise.all([
    listClassificationTree().catch(() => []),
    listSuppliers().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link
          href={isMaterial ? "/materials" : "/products"}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowRight className="size-4" />
          {isMaterial ? "חזרה לחומרי גלם" : "חזרה למוצרים"}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {isMaterial ? "חומר גלם חדש" : "מוצר חדש"}
        </h1>
        <p className="text-muted-foreground">הוספה לקטלוג</p>
      </header>

      <ProductForm
        action={createProductAction}
        initialType={initialType}
        tree={tree}
        suppliers={suppliers}
      />
    </div>
  );
}
