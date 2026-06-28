"use client";

import { useState } from "react";
import { ChevronDown, Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DepartmentNode } from "@/lib/services/classification.service";
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
} from "@/app/(dashboard)/classification/actions";

type Level = 0 | 1 | 2;
interface TNode {
  id: string;
  name: string;
  code: string | null;
  level: Level;
  children: TNode[];
}

const LEVEL_DOT = [
  "bg-[var(--brand-pink)]",
  "bg-[var(--brand-orange)]",
  "bg-[var(--brand-gold)]",
];
const LEVEL_LABEL = ["מחלקה", "תת-מחלקה", "דגם"];

function toNodes(tree: DepartmentNode[]): TNode[] {
  return tree.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    level: 0,
    children: d.subDepartments.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      level: 1 as Level,
      children: s.models.map((m) => ({
        id: m.id,
        name: m.name,
        code: m.code,
        level: 2 as Level,
        children: [],
      })),
    })),
  }));
}

type FormAction = (formData: FormData) => void | Promise<void>;
type VoidAction = () => void | Promise<void>;

function actionsFor(node: TNode): {
  update: FormAction;
  del: VoidAction;
  addChild: FormAction | null;
  childLabel: string;
} {
  switch (node.level) {
    case 0:
      return {
        update: updateDepartmentAction.bind(null, node.id),
        del: deleteDepartmentAction.bind(null, node.id),
        addChild: addSubDepartmentAction.bind(null, node.id),
        childLabel: "תת-מחלקה",
      };
    case 1:
      return {
        update: updateSubDepartmentAction.bind(null, node.id),
        del: deleteSubDepartmentAction.bind(null, node.id),
        addChild: addModelAction.bind(null, node.id),
        childLabel: "דגם",
      };
    default:
      return {
        update: updateModelAction.bind(null, node.id),
        del: deleteModelAction.bind(null, node.id),
        addChild: null,
        childLabel: "",
      };
  }
}

/** Inline name + code editor used for both add and edit. */
function NodeForm({
  action,
  name = "",
  code = "",
  placeholder,
  submitLabel,
  onDone,
}: {
  action: FormAction;
  name?: string;
  code?: string;
  placeholder: string;
  submitLabel: React.ReactNode;
  onDone: () => void;
}) {
  return (
    <form
      action={action}
      onSubmit={() => onDone()}
      className="flex items-center gap-1"
    >
      <Input
        name="name"
        defaultValue={name}
        placeholder={placeholder}
        className="h-7 w-36"
        autoFocus
      />
      <Input
        name="code"
        defaultValue={code}
        placeholder="קוד"
        className="h-7 w-16 font-mono"
      />
      <Button type="submit" size="icon" variant="ghost" aria-label="שמור">
        {submitLabel}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="ביטול"
        onClick={onDone}
      >
        <X className="size-4" />
      </Button>
    </form>
  );
}

function NodeView({ node }: { node: TNode }) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const a = actionsFor(node);
  const hasChildren = node.children.length > 0;

  return (
    <div className="tree-node">
      <div className="node-card group">
        <span className={`size-2 shrink-0 rounded-full ${LEVEL_DOT[node.level]}`} />

        {hasChildren ? (
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "הרחב" : "כווץ"}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronDown
              className={`size-4 transition-transform ${
                collapsed ? "-rotate-90" : ""
              }`}
            />
          </button>
        ) : (
          <span className="w-4" />
        )}

        {editing ? (
          <NodeForm
            action={a.update}
            name={node.name}
            code={node.code ?? ""}
            placeholder={LEVEL_LABEL[node.level]}
            submitLabel={<Check className="size-4" />}
            onDone={() => setEditing(false)}
          />
        ) : (
          <>
            <span className="font-medium whitespace-nowrap">{node.name}</span>
            {node.code && (
              <code className="bg-muted rounded px-1 font-mono text-xs">
                {node.code}
              </code>
            )}
            <div className="ms-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              {a.addChild && (
                <button
                  type="button"
                  title={`הוסף ${a.childLabel}`}
                  aria-label={`הוסף ${a.childLabel}`}
                  onClick={() => {
                    setAdding(true);
                    setCollapsed(false);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Plus className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                title="עריכה"
                aria-label="עריכה"
                onClick={() => setEditing(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" />
              </button>
              <form
                action={a.del}
                onSubmit={(e) => {
                  if (!window.confirm(`למחוק "${node.name}"? כולל כל מה שמתחתיו.`))
                    e.preventDefault();
                }}
              >
                <button type="submit" title="מחיקה" aria-label="מחיקה">
                  <Trash2 className="text-destructive size-3.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {!collapsed && (hasChildren || (adding && a.addChild)) && (
        <div className="tree-children">
          {node.children.map((c) => (
            <NodeView key={c.id} node={c} />
          ))}
          {adding && a.addChild && (
            <div className="tree-node">
              <div className="node-card border-dashed">
                <Plus className="text-muted-foreground size-3.5" />
                <NodeForm
                  action={a.addChild}
                  placeholder={`${a.childLabel} חדש`}
                  submitLabel={<Check className="size-4" />}
                  onDone={() => setAdding(false)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ClassificationTree({ tree }: { tree: DepartmentNode[] }) {
  const nodes = toNodes(tree);
  const [addingDept, setAddingDept] = useState(false);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="tree">
        {nodes.map((n) => (
          <NodeView key={n.id} node={n} />
        ))}

        <div className="tree-node">
          {addingDept ? (
            <div className="node-card border-dashed">
              <Plus className="text-muted-foreground size-3.5" />
              <NodeForm
                action={addDepartmentAction}
                placeholder="מחלקה חדשה"
                submitLabel={<Check className="size-4" />}
                onDone={() => setAddingDept(false)}
              />
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddingDept(true)}
            >
              <Plus className="size-4" />
              מחלקה חדשה
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
