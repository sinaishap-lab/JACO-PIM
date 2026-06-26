import { Plus, Trash2, AlertCircle, FolderTree } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { listClassificationTree } from "@/lib/services/classification.service";
import type {
  DepartmentNode,
  SubDepartmentNode,
} from "@/lib/services/classification.service";
import {
  addDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
  addSubDepartmentAction,
  updateSubDepartmentAction,
  deleteSubDepartmentAction,
  addModelAction,
  updateModelAction,
  deleteModelAction,
} from "./actions";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

type FormAction = (formData: FormData) => void | Promise<void>;
type DeleteAction = () => void | Promise<void>;

function EditRow({
  name,
  code,
  updateAction,
  deleteAction,
  deleteLabel,
  strong,
}: {
  name: string;
  code: string | null;
  updateAction: FormAction;
  deleteAction: DeleteAction;
  deleteLabel: string;
  strong?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={updateAction} className="flex items-center gap-2">
        <Input
          name="name"
          defaultValue={name}
          className={`h-8 w-44 ${strong ? "font-semibold" : ""}`}
        />
        <Input
          name="code"
          defaultValue={code ?? ""}
          placeholder="קוד"
          className="h-8 w-20 font-mono"
        />
        <Button type="submit" size="sm" variant="outline">
          שמור
        </Button>
      </form>
      <form action={deleteAction}>
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          aria-label={deleteLabel}
        >
          <Trash2 className="text-destructive size-4" />
        </Button>
      </form>
    </div>
  );
}

function AddRow({
  action,
  placeholder,
  label,
}: {
  action: FormAction;
  placeholder: string;
  label: string;
}) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <Input name="name" placeholder={placeholder} className="h-8 w-44" />
      <Input name="code" placeholder="קוד" className="h-8 w-20 font-mono" />
      <Button type="submit" size="sm" variant="outline">
        <Plus className="size-4" />
        {label}
      </Button>
    </form>
  );
}

function SubDepartment({ sub }: { sub: SubDepartmentNode }) {
  return (
    <div className="border-muted space-y-2 border-s-2 ps-4">
      <EditRow
        name={sub.name}
        code={sub.code}
        updateAction={updateSubDepartmentAction.bind(null, sub.id)}
        deleteAction={deleteSubDepartmentAction.bind(null, sub.id)}
        deleteLabel={`מחק תת-מחלקה ${sub.name}`}
      />
      <div className="space-y-2 ps-4">
        {sub.models.map((m) => (
          <EditRow
            key={m.id}
            name={m.name}
            code={m.code}
            updateAction={updateModelAction.bind(null, m.id)}
            deleteAction={deleteModelAction.bind(null, m.id)}
            deleteLabel={`מחק דגם ${m.name}`}
          />
        ))}
        <AddRow
          action={addModelAction.bind(null, sub.id)}
          placeholder="דגם חדש"
          label="דגם"
        />
      </div>
    </div>
  );
}

function Department({ dep }: { dep: DepartmentNode }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <EditRow
          name={dep.name}
          code={dep.code}
          updateAction={updateDepartmentAction.bind(null, dep.id)}
          deleteAction={deleteDepartmentAction.bind(null, dep.id)}
          deleteLabel={`מחק מחלקה ${dep.name}`}
          strong
        />
        <div className="space-y-3">
          {dep.subDepartments.map((sub) => (
            <SubDepartment key={sub.id} sub={sub} />
          ))}
          <AddRow
            action={addSubDepartmentAction.bind(null, dep.id)}
            placeholder="תת-מחלקה חדשה"
            label="תת-מחלקה"
          />
        </div>
      </CardContent>
    </Card>
  );
}

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
        <h1 className="text-2xl font-bold tracking-tight">סיווג</h1>
        <p className="text-muted-foreground">
          מחלקה ← תת-מחלקה ← דגם. הקודים משמשים לג&apos;ינרוט המק&quot;ט.
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
        <div className="space-y-4">
          {tree.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <FolderTree className="text-muted-foreground size-10" />
                <p className="text-muted-foreground text-sm">
                  עדיין אין מחלקות. הוסיפו מחלקה ראשונה למטה.
                </p>
              </CardContent>
            </Card>
          )}
          {tree.map((dep) => (
            <Department key={dep.id} dep={dep} />
          ))}

          <Card>
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-medium">הוספת מחלקה</p>
              <AddRow
                action={addDepartmentAction}
                placeholder="מחלקה חדשה"
                label="מחלקה"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
