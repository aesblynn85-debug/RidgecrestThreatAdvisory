"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAction } from "./audit";

export async function addTimelineNote(formData: FormData) {
  const caseId = String(formData.get("case_id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const occurredRaw = String(formData.get("occurred_at") || "");

  if (!caseId || !title) return { error: "Pick a case and enter a title." };

  const occurred_at = occurredRaw && !isNaN(Date.parse(occurredRaw))
    ? new Date(occurredRaw).toISOString()
    : new Date().toISOString();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("timeline_notes").insert({
    case_id: caseId,
    title,
    description,
    occurred_at,
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  await logAction(`Added timeline note "${title}"`, caseId);
  revalidatePath("/timeline");
  revalidatePath(`/cases/${caseId}`);
  return { error: null };
}
