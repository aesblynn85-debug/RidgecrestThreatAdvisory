import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThreatBadge, ConfidenceBadge } from "@/components/badges";
import { StatusToggle } from "./status-toggle";
import { AssessmentTabs } from "./assessment-tabs";

export const dynamic = "force-dynamic";

const orgName = process.env.NEXT_PUBLIC_ORG_NAME || "R.A.V.E.N. Intelligence";

export default async function AssessmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*, cases(title, client_name)")
    .eq("id", params.id)
    .single();

  if (!assessment) notFound();

  return (
    <div>
      <Link href="/assessments" className="text-xs text-slate-500 hover:text-accent print:hidden">
        ← All assessments
      </Link>

      <div className="mb-6 mt-1 flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <ThreatBadge level={assessment.threat_level} />
            <ConfidenceBadge level={assessment.confidence_level} />
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-white">{assessment.title}</h1>
          {assessment.cases?.title && (
            <p className="mt-1 text-sm text-slate-400">Case: {assessment.cases.title}</p>
          )}
        </div>
        <StatusToggle assessmentId={assessment.id} status={assessment.status} />
      </div>

      <AssessmentTabs
        assessment={assessment as any}
        caseTitle={assessment.cases?.title}
        clientName={assessment.cases?.client_name}
        orgName={orgName}
      />
    </div>
  );
}
