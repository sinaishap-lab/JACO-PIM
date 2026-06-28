"use client";

import Link from "next/link";
import { Fragment, useState, useTransition } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProductsAction } from "@/app/(dashboard)/products/actions";

export type ProductSizeRow = { value: string; price: string; cost: string };

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  price: string;
  supplierLabel: string;
  costDisplay: string;
  sizes: ProductSizeRow[];
};

export function ProductsTable({
  items,
  priceHeader,
}: {
  items: ProductRow[];
  priceHeader: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const toggleExpand = (id: string) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = items.length > 0 && selected.size === items.length;

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));

  const del = (ids: string[], label: string) => {
    if (!window.confirm(`למחוק ${label}? פעולה זו אינה הפיכה.`)) return;
    startTransition(async () => {
      await deleteProductsAction(ids);
      setSelected(new Set());
    });
  };

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={() => del([...selected], `${selected.size} מוצרים`)}
          >
            <Trash2 />
            מחק נבחרים ({selected.size})
          </Button>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground text-sm"
            onClick={() => setSelected(new Set())}
          >
            נקה בחירה
          </button>
        </div>
      )}

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <input
                  type="checkbox"
                  aria-label="בחר הכל"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="border-input size-4 rounded"
                />
              </TableHead>
              <TableHead>מק&quot;ט</TableHead>
              <TableHead>שם</TableHead>
              <TableHead>{priceHeader}</TableHead>
              <TableHead>ספק עיקרי</TableHead>
              <TableHead>עלות</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => {
              const isOpen = expanded.has(p.id);
              return (
                <Fragment key={p.id}>
                  <TableRow data-state={selected.has(p.id) ? "selected" : undefined}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`בחר ${p.name}`}
                        checked={selected.has(p.id)}
                        onChange={() => toggle(p.id)}
                        className="border-input size-4 rounded"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-1">
                        {p.sizes.length > 0 && (
                          <button
                            type="button"
                            aria-label="הצג גדלים ומחירים"
                            aria-expanded={isOpen}
                            onClick={() => toggleExpand(p.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ChevronDown
                              className={`size-4 transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                        <Link
                          href={`/products/${p.id}`}
                          className="transition-colors hover:text-primary"
                        >
                          {p.name}
                        </Link>
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {p.price}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.supplierLabel}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {p.costDisplay}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" aria-label="עריכה">
                          <Link href={`/products/${p.id}`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`מחק ${p.name}`}
                          disabled={pending}
                          onClick={() => del([p.id], `את "${p.name}"`)}
                        >
                          <Trash2 className="text-destructive size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isOpen && p.sizes.length > 0 && (
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell />
                      <TableCell colSpan={6} className="py-2">
                        <div className="space-y-1">
                          <div className="text-muted-foreground grid grid-cols-3 gap-2 text-xs font-medium">
                            <span>גודל</span>
                            <span>מחיר מכירה</span>
                            <span>עלות</span>
                          </div>
                          {p.sizes.map((s, i) => (
                            <div key={i} className="grid grid-cols-3 gap-2 text-sm">
                              <span>{s.value}</span>
                              <span className="text-muted-foreground">{s.price}</span>
                              <span className="text-muted-foreground">{s.cost}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
