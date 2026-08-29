import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/page-header";
import { AssessmentsIcon } from "@/components/icons";
import { ThreatBadge, ConfidenceBadge } from "@/components/badges";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage() {
  const supabase = createClient();
  const { data: assessments } = await supabase
    .from("assessments")
    .select("*, cases(title)")
    .order("created_at", { ascending: false });

  const hasAssessments = assessments && assessments.length > 0;

  return (
    <div>
      <PageHeader
        kicker="Finished intelligence"
        title="Assessments"
        description="Document judgments, confidence, indicators, gaps, and protective recommendations."
        action={
          <Link href="/assessments/new" className="btn-primary">
            + New assessment
          </Link>
        }
      />

      {!hasAssessments ? (
        <EmptyState
          icon={<AssessmentsIcon className="h-10 w-10" />}
          title="No assessments yet"
          description="Once a case has enough gathered intelligence, write an assessment to brief the client."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {assessments.map((a: any) => (
            <Link key={a.id} href={`/assessments/${a.id}`} className="card hover:border-accent/40">
              <div className="flex items-start justify-between gap-2">
                <ThreatBadge level={a.threat_level} />
                <ConfidenceBadge level={a.confidence_level} />
              </div>
              <p className="mt-3 font-medium text-white">{a.title}</p>
              {a.summary && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">{a.summary}</p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                {a.cases?.title || "No case"} · {a.status === "final" ? "Final" : "Draft"} ·{" "}
                {formatDate(a.created_at)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
