"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EntityType } from "@/lib/supabase/types";
import { logAction } from "./audit";

export async function createEntity(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = String(formData.get("name") || "").trim();
  const entity_type = String(formData.get("entity_type") || "other") as EntityType;
  const notes = String(formData.get("notes") || "").trim() || null;
  const caseId = String(formData.get("case_id") || "").trim() || null;

  // Free-form key:value lines -> attributes jsonb, e.g. "phone: 555-0134"
  const attributesRaw = String(formData.get("attributes") || "");
  const attributes: Record<string, string> = {};
  for (const line of attributesRaw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (key && value) attributes[key] = value;
    }
  }

  if (!name) return { error: "Name is required." };

  const { data, error } = await supabase
    .from("entities")
    .insert({ name, entity_type, notes, attributes, created_by: user?.id ?? null })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (caseId) {
    await supabase.from("case_entities").upsert({ case_id: caseId, entity_id: data.id });
    revalidatePath(`/cases/${caseId}`);
  }

  await logAction(`Added entity "${name}"`, data.id);
  revalidatePath("/entities");
  return { error: null, id: data.id as string };
}
