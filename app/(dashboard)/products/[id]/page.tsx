import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { ProductForm } from "@/components/products/product-form";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import { ProductAttributes } from "@/components/products/product-attributes";
import { ProductComponents } from "@/components/products/product-components";
import { ProductSuppliers } from "@/components/products/product-suppliers";
import { getProduct } from "@/lib/services/product.service";
import { listAttributes } from "@/lib/services/attribute.service";
import { getProductAttributeValues } from "@/lib/services/attribute-value.service";
import {
  listComponents,
  listRawMaterials,
} from "@/lib/services/component.service";
import { listProductSuppliers } from "@/lib/services/product-supplier.service";
import { listSuppliers } from "@/lib/services/supplier.service";
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

  const isFinished = product.type === "finished";

  const [attributes, values, components, rawMaterials, productSuppliers, suppliers] =
    await Promise.all([
      listAttributes(),
      getProductAttributeValues(id),
      isFinished ? listComponents(id) : Promise.resolve([]),
      isFinished ? listRawMaterials() : Promise.resolve([]),
      listProductSuppliers(id),
      listSuppliers(),
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
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">ספקים</h2>
          <p className="text-muted-foreground text-sm">
            מי מספק את המוצר, ובכמה. העלות נקבעת לפי הספק המועדף או הזול ביותר.
          </p>
        </div>
        <ProductSuppliers
          productId={product.id}
          links={productSuppliers}
          suppliers={suppliers}
        />
      </section>

      {isFinished && (
        <section className="space-y-4 border-t pt-8">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">עלות ומתכון</h2>
            <p className="text-muted-foreground text-sm">
              חומרי הגלם שמהם מורכב המוצר. העלות והרווחיות מחושבות אוטומטית.
            </p>
          </div>
          <ProductComponents
            productId={product.id}
            components={components}
            rawMaterials={rawMaterials}
            salePrice={product.salePrice}
          />
        </section>
      )}

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
