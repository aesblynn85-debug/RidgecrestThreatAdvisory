import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge } from "@/components/badges";
import { CasesIcon, ChevronRightIcon } from "@/components/icons";
import { formatDate } from "@/lib/format";
import { NewCaseForm } from "./new-case-form";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const supabase = createClient();
  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });

  const hasCases = cases && cases.length > 0;

  return (
    <div>
      <PageHeader
        kicker="Investigative workspace"
        title="Cases"
        description="Organize CAD records, entities, external sources, links, and finished intelligence by case."
        action={hasCases ? <NewCaseForm /> : undefined}
      />

      {!hasCases ? (
        <EmptyState
          icon={<CasesIcon className="h-10 w-10" />}
          title="No cases opened"
          description="Create a case when an incident, subject, or pattern requires sustained analysis."
          action={<div className="mt-2"><NewCaseForm /></div>}
        />
      ) : (
        <div className="space-y-2">
          {cases.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="card flex items-center justify-between gap-4 transition-colors hover:border-accent/40"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {c.case_number && (
                    <span className="font-mono text-xs text-slate-500">
                      {c.case_number}
                    </span>
                  )}
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1 truncate font-medium text-white">{c.title}</p>
                <p className="mt-0.5 truncate text-sm text-slate-400">
                  {c.client_name || "No client on file"} · opened{" "}
                  {formatDate(c.created_at)}
                </p>
              </div>
              <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-600" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
