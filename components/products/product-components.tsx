import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  computeCost,
  type ComponentLine,
  type RawMaterialOption,
} from "@/lib/services/component.service";
import {
  addComponentAction,
  removeComponentAction,
} from "@/app/(dashboard)/products/actions";

function ils(value: number | null): string {
  return value == null ? "—" : `₪${value.toLocaleString("he-IL")}`;
}

export function ProductComponents({
  productId,
  components,
  rawMaterials,
  salePrice,
}: {
  productId: string;
  components: ComponentLine[];
  rawMaterials: RawMaterialOption[];
  salePrice: number | null;
}) {
  const cost = computeCost(components);
  const margin = salePrice != null ? salePrice - cost : null;
  const marginPct =
    salePrice != null && salePrice > 0 ? (margin! / salePrice) * 100 : null;

  return (
    <div className="space-y-4">
      {/* Cost / margin summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryBox label="עלות מחושבת" value={ils(cost)} />
        <SummaryBox label="מחיר מכירה" value={ils(salePrice)} />
        <SummaryBox
          label="רווח"
          value={ils(margin)}
          tone={margin == null ? undefined : margin >= 0 ? "good" : "bad"}
        />
        <SummaryBox
          label="רווחיות"
          value={marginPct == null ? "—" : `${marginPct.toFixed(0)}%`}
          tone={marginPct == null ? undefined : marginPct >= 0 ? "good" : "bad"}
        />
      </div>

      {/* Recipe table */}
      {components.length > 0 && (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>חומר גלם</TableHead>
                <TableHead>עלות יחידה</TableHead>
                <TableHead>כמות</TableHead>
                <TableHead>עלות שורה</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((line) => (
                <TableRow key={line.componentId}>
                  <TableCell className="font-medium">{line.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {ils(line.costPrice)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {line.quantity}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ils((line.costPrice ?? 0) * line.quantity)}
                  </TableCell>
                  <TableCell className="text-end">
                    <form
                      action={removeComponentAction.bind(
                        null,
                        productId,
                        line.componentId
                      )}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        aria-label={`הסר ${line.name}`}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add a raw material */}
      {rawMaterials.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          כדי להוסיף חומרי גלם, צרו קודם מוצרים מסוג &quot;חומר גלם&quot;.
        </p>
      ) : (
        <form
          action={addComponentAction.bind(null, productId)}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="min-w-48 flex-1 space-y-1.5">
            <label htmlFor="componentId" className="text-sm font-medium">
              חומר גלם
            </label>
            <select
              id="componentId"
              name="componentId"
              required
              className={cn(
                "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              )}
            >
              {rawMaterials.map((rm) => (
                <option key={rm.id} value={rm.id}>
                  {rm.name} ({ils(rm.costPrice)})
                </option>
              ))}
            </select>
          </div>
          <div className="w-28 space-y-1.5">
            <label htmlFor="quantity" className="text-sm font-medium">
              כמות
            </label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              step="any"
              min="0"
              defaultValue="1"
            />
          </div>
          <Button type="submit" variant="outline">
            <Plus />
            הוסף
          </Button>
        </form>
      )}
    </div>
  );
}

function SummaryBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad";
}) {
  return (
    <Card className="py-0">
      <CardContent className="space-y-1 p-4">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p
          className={cn(
            "text-lg font-semibold",
            tone === "good" && "text-emerald-600",
            tone === "bad" && "text-destructive"
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
