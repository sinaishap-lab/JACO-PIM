import Link from "next/link";
import { Plus, Truck, AlertCircle } from "lucide-react";

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
import { listSuppliers } from "@/lib/services/supplier.service";
import type { Supplier } from "@/lib/types";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function SuppliersPage() {
  let suppliers: Supplier[] = [];
  let loadError: string | null = null;

  if (supabaseConfigured) {
    try {
      suppliers = await listSuppliers();
    } catch (err) {
      loadError = err instanceof Error ? err.message : "שגיאה בטעינת הספקים";
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">ספקים</h1>
          <p className="text-muted-foreground">ניהול ספקי המוצרים וחומרי הגלם</p>
        </div>
        <Button asChild disabled={!supabaseConfigured}>
          <Link href="/suppliers/new">
            <Plus />
            ספק חדש
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
              חברו את Supabase לפי{" "}
              <code className="font-mono">supabase/README.md</code> כדי לנהל
              ספקים.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : loadError ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              שגיאה בטעינת הספקים
            </CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
        </Card>
      ) : suppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Truck className="text-muted-foreground size-10" />
            <div className="space-y-1">
              <p className="font-medium">עדיין אין ספקים</p>
              <p className="text-muted-foreground text-sm">
                הוסיפו ספק ראשון כדי שתוכלו לשייך אותו למוצרים.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>קוד</TableHead>
                <TableHead>איש קשר</TableHead>
                <TableHead>טלפון</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/suppliers/${s.id}`}
                      className="hover:underline"
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
