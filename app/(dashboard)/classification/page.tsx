import { AlertCircle, FolderTree } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { listClassificationTree } from "@/lib/services/classification.service";
import type { DepartmentNode } from "@/lib/services/classification.service";
import { ClassificationTree } from "@/components/classification/classification-tree";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function ClassificationPage() {
  let tree: DepartmentNode[] = [];
  let loadError: string | null = null;

  if (supabaseConfigured) {
    try {
      tree = await listClassificationTree();
    } catch (err) {
      loadError = err instanceof Error ? err.message : "שגיאה בטעינת הסיווג";
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-brand-gradient w-fit">
          סיווג
        </h1>
        <p className="text-muted-foreground">
          מחלקה ← תת-מחלקה ← דגם. הקודים משמשים לג&apos;ינרוט המק&quot;ט. ריחפו על
          צומת לפעולות, ולחצו על החץ כדי לכווץ/להרחיב.
        </p>
      </header>

      {!supabaseConfigured ? (
        <Card>
          <CardContent className="text-muted-foreground flex items-center gap-2 p-6 text-sm">
            <AlertCircle className="size-5" />
            Supabase עדיין לא מחובר — ראו{" "}
            <code className="font-mono">supabase/README.md</code>.
          </CardContent>
        </Card>
      ) : loadError ? (
        <Card>
          <CardContent className="text-destructive flex items-center gap-2 p-6 text-sm">
            <AlertCircle className="size-5" />
            {loadError}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            {tree.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <FolderTree className="text-muted-foreground size-10" />
                <p className="text-muted-foreground text-sm">
                  עדיין אין מחלקות. הוסיפו מחלקה ראשונה.
                </p>
                <ClassificationTree tree={tree} />
              </div>
            ) : (
              <ClassificationTree tree={tree} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
