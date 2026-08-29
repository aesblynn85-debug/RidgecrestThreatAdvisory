"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Confidence } from "@/lib/supabase/types";
import { logAction } from "./audit";

export async function createEntityLink(formData: FormData) {
  const caseId = String(formData.get("case_id") || "");
  const fromEntityId = String(formData.get("from_entity_id") || "");
  const toEntityId = String(formData.get("to_entity_id") || "");
  const relationshipType = String(formData.get("relationship_type") || "").trim();
  const confidence = String(formData.get("confidence") || "moderate") as Confidence;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!caseId || !fromEntityId || !toEntityId) {
    return { error: "Pick both entities." };
  }
  if (fromEntityId === toEntityId) {
    return { error: "Pick two different entities." };
  }
  if (!relationshipType) {
    return { error: "Describe the relationship (e.g. \"associate of\")." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("entity_links").insert({
    case_id: caseId,
    from_entity_id: fromEntityId,
    to_entity_id: toEntityId,
    relationship_type: relationshipType,
    confidence,
    notes,
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  await logAction(`Recorded relationship "${relationshipType}"`, caseId);
  revalidatePath("/links");
  return { error: null };
}

export async function deleteEntityLink(linkId: string, caseId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("entity_links").delete().eq("id", linkId);
  if (error) return { error: error.message };

  revalidatePath("/links");
  revalidatePath(`/cases/${caseId}`);
  return { error: null };
}
