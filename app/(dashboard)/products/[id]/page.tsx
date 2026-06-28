import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import {
  ProductCreateForm,
  type ProductFormInitial,
} from "@/components/products/product-create-form";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import { getProduct } from "@/lib/services/product.service";
import { listAttributes } from "@/lib/services/attribute.service";
import { getProductAttributeValues } from "@/lib/services/attribute-value.service";
import {
  listComponents,
  listRawMaterials,
} from "@/lib/services/component.service";
import { listProductSuppliers } from "@/lib/services/product-supplier.service";
import { listSupplierVariantSkus } from "@/lib/services/supplier-variant-sku.service";
import { listSuppliers } from "@/lib/services/supplier.service";
import { listClassificationTree } from "@/lib/services/classification.service";
import { listSizes, listColors } from "@/lib/services/variant.service";
import { listProductImages } from "@/lib/services/product-image.service";
import { updateProductAction } from "../actions";

const str = (v: number | null | undefined) => (v != null ? String(v) : "");

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const isFinished = product.type === "finished";

  const [
    attributes,
    values,
    components,
    rawMaterials,
    productSuppliers,
    suppliers,
    tree,
    sizes,
    colors,
    variantSkuMap,
    productImages,
  ] = await Promise.all([
    listAttributes(),
    getProductAttributeValues(id),
    isFinished ? listComponents(id) : Promise.resolve([]),
    isFinished ? listRawMaterials() : Promise.resolve([]),
    listProductSuppliers(id),
    listSuppliers(),
    listClassificationTree(),
    isFinished ? listSizes(id) : Promise.resolve([]),
    isFinished ? listColors(id) : Promise.resolve([]),
    listSupplierVariantSkus(id),
    listProductImages(id),
  ]);

  // Flatten per-variant SKUs/costs into the form's `supplierId::size::color` keys.
  const variantSku: Record<string, string> = {};
  const variantCost: Record<string, string> = {};
  for (const [supplierId, inner] of variantSkuMap) {
    for (const [variantKey, v] of inner) {
      const key = `${supplierId}::${variantKey}`;
      if (v.sku) variantSku[key] = v.sku;
      if (v.cost != null) variantCost[key] = String(v.cost);
    }
  }

  const initial: ProductFormInitial = {
    pricingMode: sizes.length > 0 ? "sized" : "single",
    suppliers: productSuppliers.map((l) => ({
      supplierId: l.supplierId,
      costPrice: str(l.costPrice),
      supplierSku: l.supplierSku ?? "",
      supplierName: l.supplierProductName ?? "",
      isPreferred: l.isPreferred,
    })),
    sizes: sizes.map((s) => ({
      value: s.value,
      price: str(s.price),
      costPrice: str(s.costPrice),
    })),
    colors: colors.map((c) => ({ value: c.value, letter: c.letter ?? "" })),
    components: components.map((c) => ({
      componentId: c.componentId,
      quantity: String(c.quantity),
    })),
    variantSku,
    variantCost,
    fieldValues: values,
    images: productImages.map((im) => ({ url: im.url, isPrimary: im.isPrimary })),
  };

  const action = updateProductAction.bind(null, id);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/products"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowRight className="size-4" />
            חזרה למוצרים
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-brand-gradient w-fit">
            {product.name}
          </h1>
          <p className="text-muted-foreground font-mono text-sm" dir="ltr">
            {product.sku}
          </p>
        </div>
        <DeleteProductButton id={product.id} name={product.name} />
      </header>

      <ProductCreateForm
        action={action}
        product={product}
        tree={tree}
        suppliers={suppliers}
        rawMaterials={rawMaterials}
        attributes={attributes}
        initial={initial}
      />
    </div>
  );
}
