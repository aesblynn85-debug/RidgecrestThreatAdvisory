import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only client pointed at the CAD's own Supabase project (a different
 * project than this app's). Uses the CAD's public anon key -- safe to use
 * server-side here since it only grants what the CAD's own Row Level
 * Security policies already allow anyone with that key (its calls/reports/
 * guard_notes tables permit anon reads by design; see RidgecrestCAD's
 * supabase/schema.sql).
 */
function cadClient() {
    const url = process.env.CAD_SUPABASE_URL;
    const key = process.env.CAD_SUPABASE_ANON_KEY;
    if (!url || !key) {
          throw new Error(
                  "CAD_SUPABASE_URL / CAD_SUPABASE_ANON_KEY are not set. Add them to your environment to enable CAD sync."
                );
    }
    return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

export interface CadCall {
    id: string;
    code: string | null;
    nature: string | null;
    priority: number | null;
    location: string | null;
    status: string | null;
          assigned_units: string[] | null;
    created_at: string;
}

export interface CadReport {
    id: string;
    type_label: string | null;
    subject: string | null;
    narrative: string | null;
    location: string | null;
    occurred: string | null;
    status: string | null;
    written_by: string | null;
    submitted_at: string | null;
}

export interface CadGuardNote {
    id: string;
    text: string;
    post: string | null;
    author: string | null;
    created_at: string;
    resolved: boolean | null;
}

export async function fetchCadSourceData() {
    const supabase = cadClient();

  const [callsRes, reportsRes, notesRes] = await Promise.all([
        supabase
          .from("calls")
          .select("id, code, nature, priority, location, status, assigned_units, created_at")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("reports")
          .select("id, type_label, subject, narrative, location, occurred, status, written_by, submitted_at")
          .order("submitted_at", { ascending: false, nullsFirst: false })
          .limit(500),
        supabase
          .from("guard_notes")
          .select("id, text, post, author, created_at, resolved")
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

  const err = callsRes.error || reportsRes.error || notesRes.error;
    if (err) throw new Error(`CAD read failed: ${err.message}`);

  return {
        calls: (callsRes.data || []) as CadCall[],
      reports: (reportsRes.data || []) as CadReport[],
        guardNotes: (notesRes.data || []) as CadGuardNote[],
  };
}
