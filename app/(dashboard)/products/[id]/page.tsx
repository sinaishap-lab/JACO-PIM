import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { ProductForm } from "@/components/products/product-form";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import { ProductAttributes } from "@/components/products/product-attributes";
import { ProductComponents } from "@/components/products/product-components";
import { ProductSuppliers } from "@/components/products/product-suppliers";
import { ProductVariants } from "@/components/products/product-variants";
import { getProduct } from "@/lib/services/product.service";
import { listAttributes } from "@/lib/services/attribute.service";
import { getProductAttributeValues } from "@/lib/services/attribute-value.service";
import {
  listComponents,
  listRawMaterials,
} from "@/lib/services/component.service";
import { listProductSuppliers } from "@/lib/services/product-supplier.service";
import { listSuppliers } from "@/lib/services/supplier.service";
import { listClassificationTree } from "@/lib/services/classification.service";
import { listSizes, listColors } from "@/lib/services/variant.service";
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
  ]);

  const supplierAttributes = attributes.filter(
    (a) => a.audience === "supplier"
  );
  const customerAttributes = attributes.filter(
    (a) => a.audience === "customer"
  );
  const preferredLink = productSuppliers.find((l) => l.isPreferred);
  const preferredSupplierId = preferredLink?.supplierId ?? null;
  const preferredSupplierSku = preferredLink?.supplierSku ?? null;

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
        <ProductForm
          action={action}
          product={product}
          tree={tree}
          suppliers={suppliers}
          preferredSupplierId={preferredSupplierId}
          preferredSupplierSku={preferredSupplierSku}
        />
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
            <h2 className="text-lg font-semibold">וריאנטים</h2>
            <p className="text-muted-foreground text-sm">
              גדלים (מחיר לכל גודל) וצבעים (אות לועזית למק&quot;ט). השילובים
              הם הוריאנטים למכירה.
            </p>
          </div>
          <ProductVariants
            productId={product.id}
            sizes={sizes}
            colors={colors}
            salePrice={product.salePrice}
            baseSku={product.sku}
          />
        </section>
      )}

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

      {attributes.length === 0 ? (
        <section className="space-y-4 border-t pt-8">
          <h2 className="text-lg font-semibold">מאפיינים</h2>
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
        </section>
      ) : (
        <>
          <section className="space-y-4 border-t pt-8">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">מאפייני ספק</h2>
              <p className="text-muted-foreground text-sm">
                מידע פנימי על המוצר — טכניקת הדפוס, חומרים, הערות ספק ועוד.
              </p>
            </div>
            {supplierAttributes.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                לא הוגדרו מאפייני ספק.
              </p>
            ) : (
              <ProductAttributes
                productId={product.id}
                audience="supplier"
                attributes={supplierAttributes}
                values={values}
              />
            )}
          </section>

          <section className="space-y-4 border-t pt-8">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">מאפייני לקוח</h2>
              <p className="text-muted-foreground text-sm">
                מידע שיווקי שמוצג ללקוח — שם שיווקי, תיאור, סרטון ועוד.
              </p>
            </div>
            {customerAttributes.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                לא הוגדרו מאפייני לקוח.
              </p>
            ) : (
              <ProductAttributes
                productId={product.id}
                audience="customer"
                attributes={customerAttributes}
                values={values}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
