import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/page-header";
import { OsintIcon } from "@/components/icons";
import { timeAgo } from "@/lib/format";
import { OsintSearch } from "./osint-search";

export const dynamic = "force-dynamic";

export default async function OsintPage({
  searchParams,
}: {
  searchParams: { case?: string };
}) {
  const supabase = createClient();
  const [{ data: cases }, { data: entities }, { data: recent }] = await Promise.all([
    supabase.from("cases").select("*").order("title"),
    supabase.from("entities").select("*").order("name"),
    supabase
      .from("osint_results")
      .select("*, cases(title)")
      .order("retrieved_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div>
      <PageHeader
        kicker="Live open-source research"
        title="OSINT search"
        description="Run live public-web queries, preserve result provenance, and generate a structured analytic judgment."
      />

      <OsintSearch
        cases={cases ?? []}
        entities={entities ?? []}
        defaultCaseId={searchParams.case}
      />

      <div className="mt-10">
        <h2 className="mb-3 text-sm font-medium text-slate-300">Saved search history</h2>
        {recent?.length ? (
          <div className="card divide-y divide-base-700 p-0">
            {recent.map((r: any) => (
              <div key={r.id} className="px-4 py-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{timeAgo(r.retrieved_at)}</span>
                  {r.cases?.title && <span>{r.cases.title}</span>}
                </div>
                <p className="mt-1 text-sm font-medium text-slate-100">{r.query}</p>
                {r.answer && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">{r.answer}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<OsintIcon className="h-8 w-8" />}
            title="Start with a focused lead"
            description="Search a known identifier or combine a name with a location, employer, event, or date."
          />
        )}
      </div>
    </div>
  );
}
