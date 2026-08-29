import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { NewAssessmentForm } from "./new-assessment-form";

export const dynamic = "force-dynamic";

export default async function NewAssessmentPage({
  searchParams,
}: {
  searchParams: { case?: string };
}) {
  const supabase = createClient();
  const { data: cases } = await supabase.from("cases").select("*").order("title");

  return (
    <div>
      <PageHeader kicker="Finished intelligence" title="New assessment" />
      <NewAssessmentForm cases={cases ?? []} defaultCaseId={searchParams.case} />
    </div>
  );
}
