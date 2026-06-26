import { createClient } from "@/lib/supabase/server";

/**
 * Classification service — the department → sub-department → model taxonomy.
 * Each level has a code used for SKU generation.
 */

export interface Model {
  id: string;
  subDepartmentId: string;
  name: string;
  code: string | null;
}
export interface SubDepartmentNode {
  id: string;
  departmentId: string;
  name: string;
  code: string | null;
  models: Model[];
}
export interface DepartmentNode {
  id: string;
  name: string;
  code: string | null;
  subDepartments: SubDepartmentNode[];
}

/** Returns the full classification tree, ordered by name at each level. */
export async function listClassificationTree(): Promise<DepartmentNode[]> {
  const supabase = await createClient();

  const [deps, subs, models] = await Promise.all([
    supabase.from("departments").select("*").order("name"),
    supabase.from("sub_departments").select("*").order("name"),
    supabase.from("models").select("*").order("name"),
  ]);
  if (deps.error) throw new Error(deps.error.message);
  if (subs.error) throw new Error(subs.error.message);
  if (models.error) throw new Error(models.error.message);

  const modelsBySub = new Map<string, Model[]>();
  for (const m of models.data as {
    id: string;
    sub_department_id: string;
    name: string;
    code: string | null;
  }[]) {
    const arr = modelsBySub.get(m.sub_department_id) ?? [];
    arr.push({
      id: m.id,
      subDepartmentId: m.sub_department_id,
      name: m.name,
      code: m.code,
    });
    modelsBySub.set(m.sub_department_id, arr);
  }

  const subsByDep = new Map<string, SubDepartmentNode[]>();
  for (const s of subs.data as {
    id: string;
    department_id: string;
    name: string;
    code: string | null;
  }[]) {
    const arr = subsByDep.get(s.department_id) ?? [];
    arr.push({
      id: s.id,
      departmentId: s.department_id,
      name: s.name,
      code: s.code,
      models: modelsBySub.get(s.id) ?? [],
    });
    subsByDep.set(s.department_id, arr);
  }

  return (
    deps.data as { id: string; name: string; code: string | null }[]
  ).map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    subDepartments: subsByDep.get(d.id) ?? [],
  }));
}

// ── Mutations ───────────────────────────────────────────────────────────────

export async function createDepartment(name: string, code: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("departments").insert({ name, code });
  if (error) throw new Error(error.message);
}
export async function updateDepartment(
  id: string,
  name: string,
  code: string | null
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("departments")
    .update({ name, code })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
export async function deleteDepartment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createSubDepartment(
  departmentId: string,
  name: string,
  code: string | null
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sub_departments")
    .insert({ department_id: departmentId, name, code });
  if (error) throw new Error(error.message);
}
export async function updateSubDepartment(
  id: string,
  name: string,
  code: string | null
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sub_departments")
    .update({ name, code })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
export async function deleteSubDepartment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sub_departments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createModel(
  subDepartmentId: string,
  name: string,
  code: string | null
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("models")
    .insert({ sub_department_id: subDepartmentId, name, code });
  if (error) throw new Error(error.message);
}
export async function updateModel(
  id: string,
  name: string,
  code: string | null
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("models")
    .update({ name, code })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
export async function deleteModel(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("models").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
