import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import {
  LabelPrint,
  type LabelVariant,
} from "@/components/products/label-print";
import { getProduct } from "@/lib/services/product.service";
import { listSizes, listColors } from "@/lib/services/variant.service";
import { listProductImages } from "@/lib/services/product-image.service";
import { generateVariantSku } from "@/lib/sku";

export const dynamic = "force-dynamic";

export default async function ProductLabelsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const isFinished = product.type === "finished";
  const [sizes, colors, images] = await Promise.all([
    isFinished ? listSizes(id) : Promise.resolve([]),
    isFinished ? listColors(id) : Promise.resolve([]),
    listProductImages(id),
  ]);
  const primaryImage =
    images.find((im) => im.isPrimary)?.url ?? images[0]?.url ?? null;

  const base = product.sku ?? "";
  const variants: LabelVariant[] = [];

  if (sizes.length === 0 && colors.length === 0) {
    variants.push({
      sku: base,
      name: product.name,
      size: "",
      price: product.salePrice,
    });
  } else {
    const sizeList = sizes.length ? sizes : [null];
    const colorList = colors.length ? colors : [null];
    for (const s of sizeList) {
      for (const c of colorList) {
        variants.push({
          sku: generateVariantSku(base, s?.value, c?.letter),
          name: product.name,
          size: [s?.value, c?.value].filter(Boolean).join(" "),
          price: s?.price ?? product.salePrice,
        });
      }
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <Link
          href={`/products/${id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowRight className="size-4" />
          חזרה למוצר
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-brand-gradient w-fit">
          הדפסת מדבקות
        </h1>
        <p className="text-muted-foreground">
          {product.name} — בחרו כמות מדבקות לכל גודל ולחצו הדפסה
        </p>
      </header>

      <LabelPrint
        variants={variants}
        product={{
          name: product.name,
          sku: base,
          imageUrl: primaryImage,
        }}
      />
    </div>
  );
}
