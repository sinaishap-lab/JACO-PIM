"use server";

import { revalidatePath } from "next/cache";

import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createSubDepartment,
  updateSubDepartment,
  deleteSubDepartment,
  createModel,
  updateModel,
  deleteModel,
} from "@/lib/services/classification.service";

const PATH = "/classification";

function nameCode(formData: FormData): {
  name: string;
  code: string | null;
} | null {
  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) return null;
  const codeRaw = formData.get("code");
  const code =
    typeof codeRaw === "string" && codeRaw.trim() ? codeRaw.trim() : null;
  return { name: name.trim(), code };
}

// Departments
export async function addDepartmentAction(formData: FormData) {
  const v = nameCode(formData);
  if (v) await createDepartment(v.name, v.code);
  revalidatePath(PATH);
}
export async function updateDepartmentAction(id: string, formData: FormData) {
  const v = nameCode(formData);
  if (v) await updateDepartment(id, v.name, v.code);
  revalidatePath(PATH);
}
export async function deleteDepartmentAction(id: string) {
  await deleteDepartment(id);
  revalidatePath(PATH);
}

// Sub-departments
export async function addSubDepartmentAction(
  departmentId: string,
  formData: FormData
) {
  const v = nameCode(formData);
  if (v) await createSubDepartment(departmentId, v.name, v.code);
  revalidatePath(PATH);
}
export async function updateSubDepartmentAction(id: string, formData: FormData) {
  const v = nameCode(formData);
  if (v) await updateSubDepartment(id, v.name, v.code);
  revalidatePath(PATH);
}
export async function deleteSubDepartmentAction(id: string) {
  await deleteSubDepartment(id);
  revalidatePath(PATH);
}

// Models
export async function addModelAction(
  subDepartmentId: string,
  formData: FormData
) {
  const v = nameCode(formData);
  if (v) await createModel(subDepartmentId, v.name, v.code);
  revalidatePath(PATH);
}
export async function updateModelAction(id: string, formData: FormData) {
  const v = nameCode(formData);
  if (v) await updateModel(id, v.name, v.code);
  revalidatePath(PATH);
}
export async function deleteModelAction(id: string) {
  await deleteModel(id);
  revalidatePath(PATH);
}
