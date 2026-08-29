"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CaseStatus } from "@/lib/supabase/types";
import { logAction } from "./audit";

export async function createCase(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = String(formData.get("title") || "").trim();
  const client_name = String(formData.get("client_name") || "").trim() || null;
  const case_number = String(formData.get("case_number") || "").trim() || null;
  const summary = String(formData.get("summary") || "").trim() || null;

  if (!title) return { error: "Title is required." };

  const { data, error } = await supabase
    .from("cases")
    .insert({
      title,
      client_name,
      case_number,
      summary,
      opened_by: user?.id ?? null,
      status: "open",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logAction(`Opened case "${title}"`, data.id);
  revalidatePath("/cases");
  redirect(`/cases/${data.id}`);
}

export async function updateCaseStatus(caseId: string, status: CaseStatus) {
  const supabase = createClient();
  const patch: Record<string, unknown> = { status };
  if (status === "closed") patch.closed_at = new Date().toISOString();

  const { error } = await supabase.from("cases").update(patch).eq("id", caseId);
  if (error) return { error: error.message };

  await logAction(`Set case status to "${status}"`, caseId);
  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/cases");
  return { error: null };
}

export async function updateCaseSummary(caseId: string, summary: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("cases")
    .update({ summary })
    .eq("id", caseId);
  if (error) return { error: error.message };

  revalidatePath(`/cases/${caseId}`);
  return { error: null };
}

export async function linkEntityToCase(caseId: string, entityId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("case_entities")
    .upsert({ case_id: caseId, entity_id: entityId });
  if (error) return { error: error.message };

  await logAction("Linked entity to case", caseId);
  revalidatePath(`/cases/${caseId}`);
  return { error: null };
}

export async function unlinkEntityFromCase(caseId: string, entityId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("case_entities")
    .delete()
    .eq("case_id", caseId)
    .eq("entity_id", entityId);
  if (error) return { error: error.message };

  revalidatePath(`/cases/${caseId}`);
  return { error: null };
}
