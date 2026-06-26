import { ProductsView } from "@/components/products/products-view";

export default function ProductsPage() {
  return (
    <ProductsView
      type="finished"
      title="מוצרים"
      subtitle="מוצרי הקצה למכירה"
      newHref="/products/new"
      newLabel="מוצר חדש"
      emptyText="עדיין אין מוצרים. התחילו בהוספת מוצר ראשון."
      priceHeader="מחיר מכירה"
    />
  );
}
