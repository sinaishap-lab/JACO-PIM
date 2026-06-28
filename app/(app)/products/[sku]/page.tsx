import { PRODUCTS } from "../../_data";
import ProductDetailClient from "./ProductDetailClient";

/* Pre-render a page per known SKU (also required for static export). */
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ sku: p.sku }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  return <ProductDetailClient sku={sku} />;
}
