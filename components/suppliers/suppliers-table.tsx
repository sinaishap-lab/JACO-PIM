"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ClipboardList, Pencil, Trash2 } from "lucide-react";

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
import { deleteSuppliersAction } from "@/app/(dashboard)/suppliers/actions";
import type { Supplier } from "@/lib/types";

export function SuppliersTable({ suppliers }: { suppliers: Supplier[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allSelected =
    suppliers.length > 0 && selected.size === suppliers.length;

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(suppliers.map((s) => s.id)));

  const del = (ids: string[], label: string) => {
    if (!window.confirm(`למחוק ${label}? פעולה זו אינה הפיכה.`)) return;
    startTransition(async () => {
      await deleteSuppliersAction(ids);
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
            onClick={() => del([...selected], `${selected.size} ספקים`)}
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
              <TableHead>שם</TableHead>
              <TableHead>קוד</TableHead>
              <TableHead>איש קשר</TableHead>
              <TableHead>טלפון</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    aria-label={`בחר ${s.name}`}
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                    className="border-input size-4 rounded"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/suppliers/${s.id}`}
                    className="transition-colors hover:text-primary"
                  >
                    {s.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {s.code ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.contactName ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground" dir="ltr">
                  {s.phone ?? "—"}
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      aria-label={`טופס הזמנה — ${s.name}`}
                      title="טופס הזמנה מהיר"
                    >
                      <Link href={`/suppliers/${s.id}/order`}>
                        <ClipboardList className="size-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" aria-label="עריכה">
                      <Link href={`/suppliers/${s.id}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`מחק ${s.name}`}
                      disabled={pending}
                      onClick={() => del([s.id], `את "${s.name}"`)}
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
