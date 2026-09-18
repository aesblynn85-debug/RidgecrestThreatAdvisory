"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ThreatFeedSource, ThreatFeedIndicatorType } from "@/lib/supabase/types";
import { logAction } from "./audit";

export async function addThreatFeedIndicator(formData: FormData) {
    const supabase = createClient();
    const {
          data: { user },
    } = await supabase.auth.getUser();

  const value = String(formData.get("value") || "").trim();
    if (!value) return { error: "Indicator value is required." };

  const source = String(formData.get("source") || "misp") as ThreatFeedSource;
    const indicator_type = String(formData.get("indicator_type") || "other") as ThreatFeedIndicatorType;
    const description = String(formData.get("description") || "").trim() || null;
    const case_id = String(formData.get("case_id") || "").trim() || null;
    const entity_id = String(formData.get("entity_id") || "").trim() || null;
    const tagsRaw = String(formData.get("tags") || "").trim();
    const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const { error } = await supabase.from("threat_feed_indicators").insert({
        source,
        indicator_type,
        value,
        description,
        tags,
        case_id,
        entity_id,
        created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  await logAction(`Logged ${source.toUpperCase()} indicator "${value}"`, case_id ?? undefined);
    revalidatePath("/threat-feeds");
    if (case_id) revalidatePath(`/cases/${case_id}`);
    return { error: null };
}

export async function deleteThreatFeedIndicator(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("threat_feed_indicators").delete().eq("id", id);
    if (error) return { error: error.message };
    await logAction("Deleted a threat feed indicator", id);
    revalidatePath("/threat-feeds");
    return { error: null };
}
