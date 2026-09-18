"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TcapAlertType, TcapSeverity } from "@/lib/supabase/types";
import { logAction } from "./audit";

export async function addTcapAlert(formData: FormData) {
    const supabase = createClient();
    const {
          data: { user },
    } = await supabase.auth.getUser();

  const title = String(formData.get("title") || "").trim();
    if (!title) return { error: "Title is required." };

  const alert_type = String(formData.get("alert_type") || "content_alert") as TcapAlertType;
    const severity = String(formData.get("severity") || "moderate") as TcapSeverity;
    const summary = String(formData.get("summary") || "").trim() || null;
    const source_url = String(formData.get("source_url") || "").trim() || null;
    const case_id = String(formData.get("case_id") || "").trim() || null;
    const entity_id = String(formData.get("entity_id") || "").trim() || null;

  const { error } = await supabase.from("tcap_alerts").insert({
        title,
        alert_type,
        severity,
        summary,
        source_url,
        case_id,
        entity_id,
        created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  await logAction(`Logged TCAP alert "${title}"`, case_id ?? undefined);
    revalidatePath("/tcap");
    if (case_id) revalidatePath(`/cases/${case_id}`);
    return { error: null };
}

export async function deleteTcapAlert(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("tcap_alerts").delete().eq("id", id);
    if (error) return { error: error.message };
    await logAction("Deleted a TCAP alert log entry", id);
    revalidatePath("/tcap");
    return { error: null };
}
