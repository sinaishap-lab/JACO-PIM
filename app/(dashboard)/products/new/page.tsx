import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCreateForm } from "@/components/products/product-create-form";
import { createProductAction } from "../actions";
import { listClassificationTree } from "@/lib/services/classification.service";
import { listSuppliers } from "@/lib/services/supplier.service";
import { listRawMaterials } from "@/lib/services/component.service";
import { listAttributes } from "@/lib/services/attribute.service";
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

  const [tree, suppliers, rawMaterials, attributes] = await Promise.all([
    listClassificationTree().catch(() => []),
    listSuppliers().catch(() => []),
    isMaterial ? Promise.resolve([]) : listRawMaterials().catch(() => []),
    listAttributes().catch(() => []),
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
        <h1 className="text-2xl font-black tracking-tight text-brand-gradient w-fit">
          {isMaterial ? "חומר גלם חדש" : "מוצר חדש"}
        </h1>
        <p className="text-muted-foreground">כל הפרטים במסך אחד</p>
      </header>

      <ProductCreateForm
        action={createProductAction}
        initialType={initialType}
        tree={tree}
        suppliers={suppliers}
        rawMaterials={rawMaterials}
        attributes={attributes}
      />
    </div>
  );
}
