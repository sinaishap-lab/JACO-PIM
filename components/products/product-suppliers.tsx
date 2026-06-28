import { Plus, Trash2, Star } from "lucide-react";

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
import { cn } from "@/lib/utils";
import {
  effectiveCost,
  type ProductSupplierLine,
} from "@/lib/services/product-supplier.service";
import {
  addProductSupplierAction,
  removeProductSupplierAction,
  setPreferredSupplierAction,
} from "@/app/(dashboard)/products/actions";
import type { Supplier } from "@/lib/types";

function ils(value: number | null): string {
  return value == null ? "—" : `₪${value.toLocaleString("he-IL")}`;
}

const selectClass = cn(
  "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
);

export function ProductSuppliers({
  productId,
  links,
  suppliers,
}: {
  productId: string;
  links: ProductSupplierLine[];
  suppliers: Supplier[];
}) {
  const cost = effectiveCost(links);
  const cheapest =
    links
      .map((l) => l.costPrice)
      .filter((c): c is number => c != null)
      .sort((a, b) => a - b)[0] ?? null;

  // The line that determines the effective cost: preferred (with a price),
  // otherwise the cheapest. Highlighted in the table.
  const withPrice = links.filter((l) => l.costPrice != null);
  const chosen =
    withPrice.find((l) => l.isPreferred) ??
    withPrice.slice().sort((a, b) => (a.costPrice ?? 0) - (b.costPrice ?? 0))[0];
  const chosenId = chosen?.id ?? null;

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm">
        עלות אפקטיבית (הזולה):{" "}
        <span className="font-semibold">{ils(cost ?? cheapest)}</span>
      </div>

      {links.length > 0 && (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ספק</TableHead>
                <TableHead>שם הספק למוצר</TableHead>
                <TableHead>מק&quot;ט ספק</TableHead>
                <TableHead>מחיר</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((line) => (
                <TableRow
                  key={line.id}
                  className={cn(line.id === chosenId && "bg-muted/40")}
                >
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1">
                      {line.supplierLabel}
                      {line.isPreferred && (
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      )}
                      {line.id === chosenId && (
                        <span className="text-muted-foreground text-xs">
                          (נבחר)
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {line.supplierProductName ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {line.supplierSku ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {ils(line.costPrice)}
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      {!line.isPreferred && (
                        <form
                          action={setPreferredSupplierAction.bind(
                            null,
                            productId,
                            line.supplierId
                          )}
                        >
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            aria-label={`הפוך לראשי: ${line.supplierLabel}`}
                            title="הפוך לספק ראשי"
                          >
                            <Star className="text-muted-foreground size-4" />
                          </Button>
                        </form>
                      )}
                      <form
                        action={removeProductSupplierAction.bind(
                          null,
                          productId,
                          line.id
                        )}
                      >
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          aria-label={`הסר ${line.supplierLabel}`}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {suppliers.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          כדי לשייך ספק, הוסיפו קודם ספקים במסך{" "}
          <span className="font-medium">ספקים</span>.
        </p>
      ) : (
        <form
          action={addProductSupplierAction.bind(null, productId)}
          className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <label htmlFor="supplierId" className="text-sm font-medium">
              ספק
            </label>
            <select id="supplierId" name="supplierId" required className={selectClass}>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="costPrice" className="text-sm font-medium">
              מחיר (₪)
            </label>
            <Input
              id="costPrice"
              name="costPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="supplierName" className="text-sm font-medium">
              שם הספק למוצר
            </label>
            <Input
              id="supplierName"
              name="supplierName"
              placeholder="איך הספק קורא למוצר"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="supplierSku" className="text-sm font-medium">
              מק&quot;ט אצל הספק
            </label>
            <Input id="supplierSku" name="supplierSku" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="isPreferred"
              className="border-input size-4 rounded"
            />
            ספק מועדף
          </label>
          <div className="flex items-end sm:justify-end">
            <Button type="submit" variant="outline">
              <Plus />
              הוסף ספק
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
