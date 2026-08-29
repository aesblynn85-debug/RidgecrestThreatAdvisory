"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAction } from "./audit";

export async function updateOrgSettings(formData: FormData) {
  const session_timeout_hours = Number(formData.get("session_timeout_hours") || 8);
  const sign_in_throttle_seconds = Number(formData.get("sign_in_throttle_seconds") || 30);
  const cad_sync_enabled = formData.get("cad_sync_enabled") === "on";

  const supabase = createClient();
  const { error } = await supabase
    .from("org_settings")
    .update({
      session_timeout_hours,
      sign_in_throttle_seconds,
      cad_sync_enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) return { error: error.message };

  await logAction("Updated security & sync settings");
  revalidatePath("/security");
  return { error: null };
}

export async function triggerManualSync() {
  const supabase = createClient();
  const { error } = await supabase
    .from("org_settings")
    .update({ last_cad_sync_at: new Date().toISOString() })
    .eq("id", true);

  if (error) return { error: error.message };

  await logAction("Ran a manual CAD sync check");
  revalidatePath("/security");
  return { error: null };
}
