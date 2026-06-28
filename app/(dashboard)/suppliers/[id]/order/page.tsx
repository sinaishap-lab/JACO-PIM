import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { SupplierOrderForm } from "@/components/suppliers/supplier-order-form";
import { getSupplier } from "@/lib/services/supplier.service";
import { listSupplierOrderProducts } from "@/lib/services/order.service";

// Always read fresh data — never serve a stale order from cache.
export const dynamic = "force-dynamic";

export default async function SupplierOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [supplier, products] = await Promise.all([
    getSupplier(id),
    listSupplierOrderProducts(id),
  ]);

  if (!supplier) {
    notFound();
  }

  const today = new Intl.DateTimeFormat("he-IL").format(new Date());

  return (
    <div className="space-y-6">
      <header className="space-y-1 print:hidden">
        <Link
          href={`/suppliers/${id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowRight className="size-4" />
          חזרה לספק
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          טופס הזמנה — {supplier.name}
        </h1>
        <p className="text-muted-foreground">
          בחרו מוצרים וכמויות, והדפיסו טופס לשליחה לספק.
        </p>
      </header>

      <SupplierOrderForm supplier={supplier} products={products} today={today} />
    </div>
  );
}
