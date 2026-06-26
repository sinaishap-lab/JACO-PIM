import { ProductsView } from "@/components/products/products-view";

export default function MaterialsPage() {
  return (
    <ProductsView
      type="raw_material"
      title="חומרי גלם"
      subtitle="חומרי הגלם שמהם מורכבים המוצרים"
      newHref="/products/new?type=raw_material"
      newLabel="חומר גלם חדש"
      emptyText="עדיין אין חומרי גלם. הוסיפו חומר גלם ראשון."
      priceHeader="מחיר עלות"
    />
  );
}
