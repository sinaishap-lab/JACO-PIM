import Link from "next/link";
import { Plus, SlidersHorizontal, AlertCircle } from "lucide-react";

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
import { listAttributes } from "@/lib/services/attribute.service";
import {
  attributeTypeLabels,
  attributeAudienceLabels,
  type AttributeFormType,
} from "@/lib/schemas/attribute";
import type { AttributeDefinition } from "@/lib/types";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function AttributesPage() {
  let attributes: AttributeDefinition[] = [];
  let loadError: string | null = null;

  if (supabaseConfigured) {
    try {
      attributes = await listAttributes();
    } catch (err) {
      loadError = err instanceof Error ? err.message : "שגיאה בטעינת המאפיינים";
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">מאפיינים</h1>
          <p className="text-muted-foreground">
            שדות דינמיים שאפשר למלא לכל מוצר
          </p>
        </div>
        <Button asChild disabled={!supabaseConfigured}>
          <Link href="/attributes/new">
            <Plus />
            מאפיין חדש
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
              חברו את Supabase לפי <code className="font-mono">supabase/README.md</code>{" "}
              כדי לנהל מאפיינים.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : loadError ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              שגיאה בטעינת המאפיינים
            </CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
        </Card>
      ) : attributes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <SlidersHorizontal className="text-muted-foreground size-10" />
            <div className="space-y-1">
              <p className="font-medium">עדיין אין מאפיינים</p>
              <p className="text-muted-foreground text-sm">
                הגדירו מאפיין ראשון (כמו צבע או נפח) כדי להעשיר את המוצרים.
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
                <TableHead>קבוצה</TableHead>
                <TableHead>סוג</TableHead>
                <TableHead>חובה</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.map((attr) => (
                <TableRow key={attr.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/attributes/${attr.id}`}
                      className="hover:underline"
                    >
                      {attr.label}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        attr.audience === "customer" ? "default" : "secondary"
                      }
                    >
                      {attributeAudienceLabels[attr.audience]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {attributeTypeLabels[attr.type as AttributeFormType] ??
                      attr.type}
                  </TableCell>
                  <TableCell>
                    {attr.required && <Badge variant="secondary">חובה</Badge>}
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
