import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Push endpoint for a real CAD/dispatch system.
 *
 * POST /api/cad/webhook
 * Headers: x-webhook-secret: <CAD_WEBHOOK_SECRET>
 * Body: a single record object, or { "records": [ ... ] }
 *
 * Recognized fields per record (everything else is preserved in raw_data):
 *   external_id, record_type, occurred_at (ISO 8601), narrative, location, case_id
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.CAD_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const incoming = Array.isArray((body as any)?.records)
    ? (body as any).records
    : Array.isArray(body)
      ? body
      : [body];

  if (!incoming.length) {
    return NextResponse.json({ error: "No records provided" }, { status: 400 });
  }

  const KNOWN = new Set([
    "external_id",
    "record_type",
    "occurred_at",
    "narrative",
    "location",
    "case_id",
  ]);

  const records = incoming.map((r: Record<string, unknown>) => {
    const raw_data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) {
      if (!KNOWN.has(k)) raw_data[k] = v;
    }
    return {
      external_id: r.external_id ? String(r.external_id) : null,
      record_type: r.record_type ? String(r.record_type) : "incident",
      occurred_at:
        r.occurred_at && !isNaN(Date.parse(String(r.occurred_at)))
          ? new Date(String(r.occurred_at)).toISOString()
          : new Date().toISOString(),
      narrative: r.narrative ? String(r.narrative) : null,
      location: r.location ? String(r.location) : null,
      case_id: r.case_id ? String(r.case_id) : null,
      raw_data,
      source: "webhook" as const,
    };
  });

  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("cad_records")
    .upsert(records, { onConflict: "external_id", ignoreDuplicates: false, count: "exact" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from("org_settings")
    .update({ last_cad_sync_at: new Date().toISOString() })
    .eq("id", true);

  return NextResponse.json({ ok: true, imported: count ?? records.length });
}
