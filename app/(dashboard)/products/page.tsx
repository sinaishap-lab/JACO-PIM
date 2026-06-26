import Link from "next/link";
import { Plus, Package, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { Product, ProductStatus } from "@/lib/types";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const statusLabels: Record<ProductStatus, string> = {
  draft: "טיוטה",
  published: "פורסם",
  archived: "בארכיון",
};

const statusVariants: Record<
  ProductStatus,
  "default" | "secondary" | "outline"
> = {
  draft: "secondary",
  published: "default",
  archived: "outline",
};

export default async function ProductsPage() {
  let products: Product[] = [];
  let loadError: string | null = null;

  if (supabaseConfigured) {
    try {
      products = await listProducts();
    } catch (err) {
      loadError = err instanceof Error ? err.message : "שגיאה בטעינת המוצרים";
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">מוצרים</h1>
          <p className="text-muted-foreground">קטלוג המוצרים של JACO-PIM</p>
        </div>
        <Button asChild disabled={!supabaseConfigured}>
          <Link href="/products/new">
            <Plus />
            מוצר חדש
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
              כדי לראות ולנהל מוצרים, צרו פרויקט ב-Supabase והעתיקו את הערכים
              לקובץ <code className="font-mono">.env.local</code>. ההוראות
              המלאות נמצאות ב-<code className="font-mono">supabase/README.md</code>.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : loadError ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              שגיאה בטעינת המוצרים
            </CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Package className="text-muted-foreground size-10" />
            <div className="space-y-1">
              <p className="font-medium">עדיין אין מוצרים</p>
              <p className="text-muted-foreground text-sm">
                התחילו בהוספת המוצר הראשון לקטלוג.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>מק&quot;ט</TableHead>
                <TableHead>שם</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>עודכן</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs">
                    {product.sku}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/products/${product.id}`}
                      className="hover:underline"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[product.status]}>
                      {statusLabels[product.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(product.updatedAt).toLocaleDateString("he-IL")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
