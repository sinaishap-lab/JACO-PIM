import { Plus, Trash2 } from "lucide-react";

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
import type { SizeOption, ColorOption } from "@/lib/services/variant.service";
import {
  addSizeAction,
  removeSizeAction,
  addColorAction,
  removeColorAction,
} from "@/app/(dashboard)/products/actions";

function ils(value: number | null): string {
  return value == null ? "—" : `₪${value.toLocaleString("he-IL")}`;
}

export function ProductVariants({
  productId,
  sizes,
  colors,
  salePrice,
}: {
  productId: string;
  sizes: SizeOption[];
  colors: ColorOption[];
  salePrice: number | null;
}) {
  // Build the size × color combinations (handles the case of one axis only).
  const sizeList: (SizeOption | null)[] = sizes.length ? sizes : [null];
  const colorList: (ColorOption | null)[] = colors.length ? colors : [null];
  const combinations = sizeList.flatMap((s) =>
    colorList.map((c) => ({ size: s, color: c }))
  );
  const hasVariants = sizes.length > 0 || colors.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Sizes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">גדלים</h3>
        {sizes.length > 0 && (
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>גודל</TableHead>
                  <TableHead>מחיר</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizes.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.value}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {ils(s.price)}
                    </TableCell>
                    <TableCell className="text-end">
                      <form action={removeSizeAction.bind(null, productId, s.id)}>
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          aria-label={`הסר גודל ${s.value}`}
                        >
                          <Trash2 className="text-destructive size-4" />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
        <form
          action={addSizeAction.bind(null, productId)}
          className="flex items-end gap-2"
        >
          <div className="flex-1 space-y-1">
            <label htmlFor="size-value" className="text-xs font-medium">
              גודל
            </label>
            <Input id="size-value" name="value" placeholder="10.15" required />
          </div>
          <div className="w-28 space-y-1">
            <label htmlFor="size-price" className="text-xs font-medium">
              מחיר (₪)
            </label>
            <Input
              id="size-price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
          <Button type="submit" variant="outline" size="icon" aria-label="הוסף גודל">
            <Plus />
          </Button>
        </form>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">צבעים</h3>
        {colors.length > 0 && (
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>צבע</TableHead>
                  <TableHead>אות (מק&quot;ט)</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {colors.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.value}</TableCell>
                    <TableCell className="text-muted-foreground font-mono">
                      {c.letter ?? "—"}
                    </TableCell>
                    <TableCell className="text-end">
                      <form
                        action={removeColorAction.bind(null, productId, c.id)}
                      >
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          aria-label={`הסר צבע ${c.value}`}
                        >
                          <Trash2 className="text-destructive size-4" />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
        <form
          action={addColorAction.bind(null, productId)}
          className="flex items-end gap-2"
        >
          <div className="flex-1 space-y-1">
            <label htmlFor="color-value" className="text-xs font-medium">
              צבע
            </label>
            <Input id="color-value" name="value" placeholder="אדום" required />
          </div>
          <div className="w-20 space-y-1">
            <label htmlFor="color-letter" className="text-xs font-medium">
              אות
            </label>
            <Input
              id="color-letter"
              name="letter"
              dir="ltr"
              maxLength={3}
              className="font-mono uppercase"
              placeholder="R"
            />
          </div>
          <Button type="submit" variant="outline" size="icon" aria-label="הוסף צבע">
            <Plus />
          </Button>
        </form>
      </div>

      {/* Combinations */}
      {hasVariants && (
        <div className="space-y-3 lg:col-span-2">
          <h3 className="text-sm font-semibold">
            וריאנטים ({combinations.length})
          </h3>
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>גודל</TableHead>
                  <TableHead>צבע</TableHead>
                  <TableHead>מחיר</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinations.map((v, i) => (
                  <TableRow key={i}>
                    <TableCell>{v.size?.value ?? "—"}</TableCell>
                    <TableCell>{v.color?.value ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {ils(v.size?.price ?? salePrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <p className="text-muted-foreground text-xs">
            המק&quot;ט לכל וריאנט ייווצר אוטומטית בשלב הבא (ג&apos;ינרוט מק&quot;ט).
          </p>
        </div>
      )}
    </div>
  );
}
