import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { ProductForm } from "@/components/products/product-form";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import { ProductAttributes } from "@/components/products/product-attributes";
import { getProduct } from "@/lib/services/product.service";
import { listAttributes } from "@/lib/services/attribute.service";
import { getProductAttributeValues } from "@/lib/services/attribute-value.service";
import { updateProductAction } from "../actions";

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

  const [attributes, values] = await Promise.all([
    listAttributes(),
    getProductAttributeValues(id),
  ]);

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
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground font-mono text-sm">
            {product.sku}
          </p>
        </div>
        <DeleteProductButton id={product.id} name={product.name} />
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">פרטי מוצר</h2>
        <ProductForm action={action} product={product} />
      </section>

      <section className="space-y-4 border-t pt-8">
        <h2 className="text-lg font-semibold">מאפיינים</h2>
        {attributes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            עדיין לא הוגדרו מאפיינים.{" "}
            <Link
              href="/attributes/new"
              className="text-foreground underline underline-offset-4"
            >
              הגדירו מאפיין ראשון
            </Link>{" "}
            כדי למלא אותו כאן.
          </p>
        ) : (
          <ProductAttributes
            productId={product.id}
            attributes={attributes}
            values={values}
          />
        )}
      </section>
    </div>
  );
}
