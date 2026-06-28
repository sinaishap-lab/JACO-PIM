import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { saveSupplierVariantSkusAction } from "@/app/(dashboard)/products/actions";
import {
  variantKey,
  type SupplierVariant,
} from "@/lib/services/supplier-variant-sku.service";

type VariantRow = { size: string | null; color: string | null };
type LinkedSupplier = { supplierId: string; supplierLabel: string };

export function SupplierVariantSkus({
  productId,
  suppliers,
  variants,
  skuMap,
}: {
  productId: string;
  suppliers: LinkedSupplier[];
  variants: VariantRow[];
  /** supplierId → (variantKey → { sku, cost }) */
  skuMap: Map<string, Map<string, SupplierVariant>>;
}) {
  if (suppliers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        שייכו ספק למוצר (בסקציית &quot;ספקים&quot;) כדי להזין מק&quot;טים.
      </p>
    );
  }
  if (variants.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        הגדירו גדלים/צבעים כדי להזין מק&quot;ט ספק לכל וריאנט.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {suppliers.map((sup) => {
        const existing =
          skuMap.get(sup.supplierId) ?? new Map<string, SupplierVariant>();
        return (
          <form
            key={sup.supplierId}
            action={saveSupplierVariantSkusAction.bind(
              null,
              productId,
              sup.supplierId
            )}
            className="space-y-2"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold">{sup.supplierLabel}</h3>
              <Button type="submit" variant="outline" size="sm">
                <Save />
                שמירה
              </Button>
            </div>
            <input type="hidden" name="count" value={variants.length} />
            <Card className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>גודל</TableHead>
                    <TableHead>צבע</TableHead>
                    <TableHead>מק&quot;ט אצל הספק</TableHead>
                    <TableHead>מחיר עלות (₪)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((v, i) => {
                    const cur = existing.get(variantKey(v.size, v.color));
                    return (
                      <TableRow key={`${v.size}::${v.color}`}>
                        <TableCell>{v.size ?? "—"}</TableCell>
                        <TableCell>{v.color ?? "—"}</TableCell>
                        <TableCell>
                          <input
                            type="hidden"
                            name={`size_${i}`}
                            value={v.size ?? ""}
                          />
                          <input
                            type="hidden"
                            name={`color_${i}`}
                            value={v.color ?? ""}
                          />
                          <Input
                            name={`sku_${i}`}
                            dir="ltr"
                            defaultValue={cur?.sku ?? ""}
                            className="h-8"
                            placeholder="מק״ט"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            name={`cost_${i}`}
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={cur?.cost ?? ""}
                            className="h-8 w-28"
                            placeholder="0.00"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </form>
        );
      })}
    </div>
  );
}
