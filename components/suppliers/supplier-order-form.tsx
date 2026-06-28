"use client";

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { JacoLogo } from "@/components/brand/jaco-logo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { paymentTermsLabels } from "@/lib/schemas/supplier";
import type { Supplier } from "@/lib/types";
import type { OrderProduct } from "@/lib/services/order.service";

type Row = {
  productName: string;
  supplierSku: string | null;
  size: string | null;
  color: string | null;
  qty: number;
};

export function SupplierOrderForm({
  supplier,
  products,
  today,
}: {
  supplier: Supplier;
  products: OrderProduct[];
  today: string;
}) {
  // Quantity per variant key.
  const [qty, setQty] = useState<Record<string, string>>({});

  const setQ = (key: string, value: string) =>
    setQty((prev) => ({ ...prev, [key]: value }));

  // The rows that will appear in the printed order (quantity > 0).
  const orderRows = useMemo<Row[]>(() => {
    const rows: Row[] = [];
    for (const p of products) {
      for (const v of p.variants) {
        const n = Number(qty[v.key]);
        if (Number.isFinite(n) && n > 0) {
          rows.push({
            productName: p.productName,
            supplierSku: v.supplierSku,
            size: v.size,
            color: v.color,
            qty: n,
          });
        }
      }
    }
    return rows;
  }, [products, qty]);

  if (products.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        לספק זה עדיין לא משויכים מוצרים. שייכו אותו כספק במסך מוצר כדי שיופיע כאן.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editor — screen only */}
      <div className="space-y-6 print:hidden">
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            סמנו כמות מבוקשת לכל וריאנט. רק שורות עם כמות יופיעו בטופס המודפס.
          </p>
          <Button onClick={() => window.print()} disabled={orderRows.length === 0}>
            <Printer />
            הדפסה / שמירה כ-PDF
          </Button>
        </div>

        {products.map((p) => (
          <div key={p.productId} className="space-y-2">
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-semibold">{p.productName}</h3>
              {p.supplierSku && (
                <span className="text-muted-foreground font-mono text-xs" dir="ltr">
                  {p.supplierSku}
                </span>
              )}
            </div>
            <Card className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>גודל</TableHead>
                    <TableHead>צבע</TableHead>
                    <TableHead className="w-32">כמות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {p.variants.map((v) => (
                    <TableRow key={v.key}>
                      <TableCell>{v.size ?? "—"}</TableCell>
                      <TableCell>{v.color ?? "—"}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={qty[v.key] ?? ""}
                          onChange={(e) => setQ(v.key, e.target.value)}
                          placeholder="0"
                          className="h-8 w-24"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        ))}
      </div>

      {/* Printable order document — print only */}
      <div className="hidden print:block [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
        <div className="mb-4 flex items-start justify-between gap-4 border-b pb-3">
          <div className="space-y-1">
            <h1 className="text-xl font-bold">טופס הזמנה</h1>
            <p className="text-sm">ספק: {supplier.name}</p>
          {supplier.contactName && (
            <p className="text-sm">איש קשר: {supplier.contactName}</p>
          )}
          {supplier.phone && (
            <p className="text-sm" dir="ltr">
              {supplier.phone}
            </p>
          )}
          {supplier.paymentTerms && (
            <p className="text-sm">
              תנאי תשלום: {paymentTermsLabels[supplier.paymentTerms]}
            </p>
          )}
            <p className="text-sm">תאריך: {today}</p>
          </div>
          <JacoLogo />
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-1 text-start">מוצר</th>
              <th className="py-1 text-start">מק&quot;ט ספק</th>
              <th className="py-1 text-start">גודל</th>
              <th className="py-1 text-start">צבע</th>
              <th className="py-1 text-start">כמות</th>
            </tr>
          </thead>
          <tbody>
            {orderRows.map((r, i) => (
              <tr key={i} className="border-b">
                <td className="py-1">{r.productName}</td>
                <td className="py-1 font-mono" dir="ltr">
                  {r.supplierSku ?? "—"}
                </td>
                <td className="py-1">{r.size ?? "—"}</td>
                <td className="py-1">{r.color ?? "—"}</td>
                <td className="py-1">{r.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
