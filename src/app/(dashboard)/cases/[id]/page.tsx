import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge, EntityTypeBadge, ThreatBadge } from "@/components/badges";
import { formatDate, formatDateTime, timeAgo } from "@/lib/format";
import { CaseStatusForm } from "./case-status-form";
import { CaseSummaryForm } from "./case-summary-form";
import { LinkEntityForm } from "./link-entity-form";
import { unlinkEntityFromCase } from "@/lib/actions/cases";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const caseId = params.id;

  const [{ data: caseRow }, { data: linkedRows }, { data: allEntities }, { data: cadRecords }, { data: osintResults }, { data: assessments }, { data: timeline }] =
    await Promise.all([
      supabase.from("cases").select("*").eq("id", caseId).single(),
      supabase
        .from("case_entities")
        .select("entity_id, entities(*)")
        .eq("case_id", caseId),
      supabase.from("entities").select("*").order("name"),
      supabase
        .from("cad_records")
        .select("*")
        .eq("case_id", caseId)
        .order("occurred_at", { ascending: false })
        .limit(5),
      supabase
        .from("osint_results")
        .select("*")
        .eq("case_id", caseId)
        .order("retrieved_at", { ascending: false })
        .limit(5),
      supabase
        .from("assessments")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("case_timeline")
        .select("*")
        .eq("case_id", caseId)
        .order("occurred_at", { ascending: false })
        .limit(6),
    ]);

  if (!caseRow) notFound();

  type LinkedEntity = { entity_id: string; entities: any };
  const linkedEntities = ((linkedRows ?? []) as LinkedEntity[])
    .map((r) => r.entities)
    .filter(Boolean);
  const linkedIds = new Set(linkedEntities.map((e) => e.id));
  const candidates = (allEntities ?? []).filter((e) => !linkedIds.has(e.id));

  return (
    <div>
      <div className="mb-1">
        <Link href="/cases" className="text-xs text-slate-500 hover:text-accent">
          ← All cases
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {caseRow.case_number && (
              <span className="font-mono text-xs text-slate-500">
                {caseRow.case_number}
              </span>
            )}
            <span className="text-xs text-slate-500">
              opened {formatDate(caseRow.created_at)}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-white">
            {caseRow.title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {caseRow.client_name || "No client on file"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={caseRow.status} />
          <CaseStatusForm caseId={caseRow.id} status={caseRow.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <h2 className="mb-2 text-sm font-medium text-slate-300">Case summary</h2>
            <CaseSummaryForm caseId={caseRow.id} summary={caseRow.summary} />
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-300">
                Recent CAD records
              </h2>
              <Link href="/cad" className="text-xs text-accent hover:underline">
                Open CAD feed →
              </Link>
            </div>
            {cadRecords?.length ? (
              <div className="card divide-y divide-base-700 p-0">
                {cadRecords.map((r) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatDateTime(r.occurred_at)}</span>
                      <span className="uppercase">{r.record_type}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-200">
                      {r.narrative || "No narrative captured."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="card text-sm text-slate-500">
                No CAD records linked to this case yet.
              </p>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-300">
                Recent OSINT activity
              </h2>
              <Link
                href={`/osint?case=${caseRow.id}`}
                className="text-xs text-accent hover:underline"
              >
                Run a search →
              </Link>
            </div>
            {osintResults?.length ? (
              <div className="card divide-y divide-base-700 p-0">
                {osintResults.map((r) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{timeAgo(r.retrieved_at)}</span>
                      <span>{r.model}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-100">
                      {r.query}
                    </p>
                    {r.answer && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                        {r.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="card text-sm text-slate-500">
                No OSINT searches saved to this case yet.
              </p>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-300">Assessments</h2>
              <Link
                href={`/assessments/new?case=${caseRow.id}`}
                className="text-xs text-accent hover:underline"
              >
                + New assessment
              </Link>
            </div>
            {assessments?.length ? (
              <div className="space-y-2">
                {assessments.map((a) => (
                  <Link
                    key={a.id}
                    href={`/assessments/${a.id}`}
                    className="card flex items-center justify-between hover:border-accent/40"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-100">{a.title}</p>
                      <p className="text-xs text-slate-500">
                        {a.status === "final" ? "Final" : "Draft"} ·{" "}
                        {formatDate(a.created_at)}
                      </p>
                    </div>
                    <ThreatBadge level={a.threat_level} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="card text-sm text-slate-500">
                No assessments written for this case yet.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-sm font-medium text-slate-300">
              Linked entities ({linkedEntities.length})
            </h2>
            {linkedEntities.length > 0 && (
              <div className="mb-3 space-y-2">
                {linkedEntities.map((e) => (
                  <div key={e.id} className="card flex items-center justify-between py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-100">{e.name}</p>
                      <EntityTypeBadge type={e.entity_type} />
                    </div>
                    <form
                      action={async () => {
                        "use server";
                        await unlinkEntityFromCase(caseRow.id, e.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs text-slate-500 hover:text-danger"
                      >
                        Unlink
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
            <LinkEntityForm caseId={caseRow.id} candidates={candidates} />
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-300">Timeline</h2>
              <Link
                href={`/timeline?case=${caseRow.id}`}
                className="text-xs text-accent hover:underline"
              >
                Full timeline →
              </Link>
            </div>
            {timeline?.length ? (
              <div className="card space-y-3 py-4">
                {timeline.map((t) => (
                  <div key={`${t.event_type}-${t.id}`} className="flex gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-200">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {timeAgo(t.occurred_at)} · {t.event_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="card text-sm text-slate-500">Nothing recorded yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
