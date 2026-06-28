import Link from "next/link";
import { Plus, Package, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listProducts } from "@/lib/services/product.service";
import { getSupplierSummaryMap } from "@/lib/services/product-supplier.service";
import { getBomCostMap } from "@/lib/services/component.service";
import { getSizedCostRangeMap } from "@/lib/services/supplier-variant-sku.service";
import { resolveProductCost } from "@/lib/cost";
import type { Product, ProductType } from "@/lib/types";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function formatPrice(value: number | null): string {
  return value == null ? "—" : `₪${value.toLocaleString("he-IL")}`;
}

export async function ProductsView({
  type,
  title,
  subtitle,
  newHref,
  newLabel,
  emptyText,
  priceHeader,
}: {
  type: ProductType;
  title: string;
  subtitle: string;
  newHref: string;
  newLabel: string;
  emptyText: string;
  priceHeader: string;
}) {
  let products: Product[] = [];
  let summaries = new Map<
    string,
    { cost: number | null; supplierLabel: string | null }
  >();
  let bomCosts = new Map<string, number | null>();
  let costRanges = new Map<string, { min: number; max: number }>();
  let loadError: string | null = null;

  if (supabaseConfigured) {
    try {
      products = await listProducts(type);
      const ids = products.map((p) => p.id);
      [summaries, bomCosts, costRanges] = await Promise.all([
        getSupplierSummaryMap(ids),
        type === "finished"
          ? getBomCostMap(ids)
          : Promise.resolve(new Map<string, number | null>()),
        type === "finished"
          ? getSizedCostRangeMap(ids)
          : Promise.resolve(new Map<string, { min: number; max: number }>()),
      ]);
    } catch (err) {
      loadError = err instanceof Error ? err.message : "שגיאה בטעינה";
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-brand-gradient w-fit">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <Button asChild disabled={!supabaseConfigured}>
          <Link href={newHref}>
            <Plus />
            {newLabel}
          </Link>
        </Button>
      </header>

      {!supabaseConfigured ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              Supabase עדיין לא מחובר
            </CardTitle>
            <CardDescription>
              ההוראות ב-<code className="font-mono">supabase/README.md</code>.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : loadError ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              שגיאה בטעינה
            </CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Package className="text-muted-foreground size-10" />
            <p className="text-muted-foreground text-sm">{emptyText}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>מק&quot;ט</TableHead>
                <TableHead>שם</TableHead>
                <TableHead>{priceHeader}</TableHead>
                <TableHead>ספק עיקרי</TableHead>
                <TableHead>עלות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const summary = summaries.get(product.id);
                const range = costRanges.get(product.id);
                const resolvedCost = resolveProductCost({
                  type,
                  supplierCost: summary?.cost ?? null,
                  bomCost: bomCosts.get(product.id) ?? null,
                  manualCost: product.costPrice,
                });
                const costDisplay = range
                  ? range.min === range.max
                    ? formatPrice(range.min)
                    : `${formatPrice(range.min)}–${formatPrice(range.max)}`
                  : formatPrice(resolvedCost);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">
                      {product.sku ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/products/${product.id}`}
                        className="transition-colors hover:text-primary"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {type === "finished"
                        ? formatPrice(product.salePrice)
                        : formatPrice(product.costPrice)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {summary?.supplierLabel ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {costDisplay}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
