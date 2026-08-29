"use server";

import { createClient } from "@/lib/supabase/server";

/** Best-effort audit trail entry. Never throws — a logging failure should
 * never block the user's actual action. */
export async function logAction(action: string, target?: string | null) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("audit_log").insert({
      actor: user?.id ?? null,
      action,
      target: target ?? null,
    });
  } catch {
    // best-effort only
  }
}
