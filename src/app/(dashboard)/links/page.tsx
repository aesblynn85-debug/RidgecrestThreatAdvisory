import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/page-header";
import { LinkAnalysisIcon } from "@/components/icons";
import { ConfidenceBadge } from "@/components/badges";
import { LinkGraph } from "@/components/link-graph";
import { CasePicker } from "./case-picker";
import { NewLinkForm } from "./new-link-form";
import { deleteEntityLink } from "@/lib/actions/links";

export const dynamic = "force-dynamic";

export default async function LinkAnalysisPage({
  searchParams,
}: {
  searchParams: { case?: string };
}) {
  const supabase = createClient();
  const { data: cases } = await supabase.from("cases").select("*").order("title");
  const caseId = searchParams.case;

  return (
    <div>
      <PageHeader
        kicker="Relationship analysis"
        title="Link analysis"
        description="Record analyst-supported relationships and confidence between tracked entities."
        action={<CasePicker cases={cases ?? []} value={caseId} />}
      />

      {!caseId ? (
        <EmptyState
          icon={<LinkAnalysisIcon className="h-10 w-10" />}
          title="No graph yet"
          description="Choose a case above, then add at least two entities and record a relationship."
        />
      ) : (
        <LinkAnalysisForCase caseId={caseId} />
      )}
    </div>
  );
}

async function LinkAnalysisForCase({ caseId }: { caseId: string }) {
  const supabase = createClient();

  const [{ data: caseRow }, { data: linkedRows }, { data: linkRows }] = await Promise.all([
    supabase.from("cases").select("*").eq("id", caseId).single(),
    supabase.from("case_entities").select("entities(*)").eq("case_id", caseId),
    supabase
      .from("entity_links")
      .select(
        "*, from:entities!entity_links_from_entity_id_fkey(*), to:entities!entity_links_to_entity_id_fkey(*)"
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
  ]);

  const entities = (linkedRows ?? []).map((r: any) => r.entities).filter(Boolean);
  const links = (linkRows ?? []) as any[];

  if (!caseRow) {
    return <p className="card text-sm text-danger">Case not found.</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Case: <span className="text-slate-200">{caseRow.title}</span> ·{" "}
        {entities.length} entit{entities.length === 1 ? "y" : "ies"} ·{" "}
        {links.length} relationship{links.length === 1 ? "" : "s"}
      </p>

      {entities.length >= 2 && links.length > 0 && (
        <LinkGraph entities={entities} links={links} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NewLinkForm caseId={caseId} entities={entities} />

        <div>
          <p className="mb-2 text-sm font-medium text-slate-200">Recorded relationships</p>
          {links.length ? (
            <div className="card divide-y divide-base-700 p-0">
              {links.map((l) => (
                <div key={l.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-100">
                      {l.from?.name}{" "}
                      <span className="text-slate-500">— {l.relationship_type} —</span>{" "}
                      {l.to?.name}
                    </p>
                    {l.notes && <p className="mt-0.5 text-xs text-slate-500">{l.notes}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ConfidenceBadge level={l.confidence} />
                    <form
                      action={async () => {
                        "use server";
                        await deleteEntityLink(l.id, caseId);
                      }}
                    >
                      <button type="submit" className="text-xs text-slate-500 hover:text-danger">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="card text-sm text-slate-500">No relationships recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
