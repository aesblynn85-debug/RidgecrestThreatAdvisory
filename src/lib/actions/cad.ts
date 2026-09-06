"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseCsv } from "@/lib/csv";
import { fetchCadSourceData, type CadCall, type CadReport, type CadGuardNote } from "@/lib/cad-source";
import { logAction } from "./audit";

const KNOWN_COLUMNS = new Set([
    "external_id",
    "id",
    "record_type",
    "type",
    "occurred_at",
    "date",
    "time",
    "narrative",
    "description",
    "location",
    "address",
  ]);

export async function importCadCsv(formData: FormData) {
    const file = formData.get("file");
    const caseId = String(formData.get("case_id") || "").trim() || null;

  if (!(file instanceof File) || file.size === 0) {
        return { error: "Choose a CSV file first." };
  }

  const text = await file.text();
    const rows = parseCsv(text);

  if (!rows.length) {
        return { error: "That file has no data rows." };
  }

  const supabase = createClient();
    const {
          data: { user },
    } = await supabase.auth.getUser();

  const records = rows.map((row) => {
        const raw_data: Record<string, string> = {};
        for (const [k, v] of Object.entries(row)) {
                if (!KNOWN_COLUMNS.has(k) && v) raw_data[k] = v;
        }

                               const occurredRaw = row.occurred_at || row.date || row.time || "";
        const occurred_at = occurredRaw && !isNaN(Date.parse(occurredRaw))
          ? new Date(occurredRaw).toISOString()
                : new Date().toISOString();

                               return {
                                       external_id: row.external_id || row.id || null,
                                       record_type: row.record_type || row.type || "incident",
                                       occurred_at,
                                       narrative: row.narrative || row.description || null,
                                       location: row.location || row.address || null,
                                       raw_data,
                                       source: "csv_import" as const,
                                       case_id: caseId,
                                       imported_by: user?.id ?? null,
                               };
  });

  const { error, count } = await supabase
      .from("cad_records")
      .upsert(records, { onConflict: "external_id", ignoreDuplicates: false, count: "exact" });

  if (error) return { error: error.message };

  await logAction(`Imported ${records.length} CAD record(s) via CSV`, caseId);
    await supabase
      .from("org_settings")
      .update({ last_cad_sync_at: new Date().toISOString() })
      .eq("id", true);

  revalidatePath("/cad");
    revalidatePath("/security");
    if (caseId) revalidatePath(`/cases/${caseId}`);

  return { error: null, imported: count ?? records.length };
}

export async function assignCadRecordToCase(recordId: string, caseId: string | null) {
    const supabase = createClient();
    const { error } = await supabase
      .from("cad_records")
      .update({ case_id: caseId })
      .eq("id", recordId);
    if (error) return { error: error.message };

  revalidatePath("/cad");
    if (caseId) revalidatePath(`/cases/${caseId}`);
    return { error: null };
}

export async function syncCadFromSource() {
    const supabase = createClient();

  let data: { calls: CadCall[]; reports: CadReport[]; guardNotes: CadGuardNote[] };
    try {
          data = await fetchCadSourceData();
    } catch (err) {
          return { error: err instanceof Error ? err.message : "CAD sync failed." };
    }

  const records: Record<string, unknown>[] = [];

  for (const call of data.calls) {
        records.push({
                external_id: `cad-call-${call.id}`,
                record_type: "dispatch",
                occurred_at: call.created_at,
                narrative: [call.code, call.nature].filter(Boolean).join(" - ") || null,
                location: call.location || null,
                raw_data: {
                          priority: call.priority,
                          status: call.status,
                          assigned_units: call.assigned_units,
                },
                source: "cad_sync" as const,
        });
  }

  for (const report of data.reports) {
        records.push({
                external_id: `cad-report-${report.id}`,
                record_type: report.type_label || "guard_report",
                occurred_at: report.occurred || report.submitted_at || new Date().toISOString(),
                narrative: [report.subject, report.narrative].filter(Boolean).join(" - ") || null,
                location: report.location || null,
                raw_data: {
                          status: report.status,
                          written_by: report.written_by,
                          submitted_at: report.submitted_at,
                },
                source: "cad_sync" as const,
        });
  }

  for (const note of data.guardNotes) {
        records.push({
                external_id: `cad-note-${note.id}`,
                record_type: "guard_note",
                occurred_at: note.created_at,
                narrative: note.text,
                location: note.post || null,
                raw_data: {
                          author: note.author,
                          resolved: note.resolved,
                },
                source: "cad_sync" as const,
        });
  }

  if (!records.length) {
        return { error: null, imported: 0 };
  }

  const { error, count } = await supabase
      .from("cad_records")
      .upsert(records, { onConflict: "external_id", ignoreDuplicates: false, count: "exact" });

      if (error) return { error: error.message };

  await logAction(`Synced ${records.length} CAD record(s) from RidgecrestCAD`);
    await supabase
      .from("org_settings")
      .update({ last_cad_sync_at: new Date().toISOString() })
      .eq("id", true);

  revalidatePath("/cad");
    revalidatePath("/security");

  return { error: null, imported: count ?? records.length };
}
