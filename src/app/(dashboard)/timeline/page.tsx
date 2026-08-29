import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/page-header";
import { TimelineIcon } from "@/components/icons";
import { CasePicker } from "../links/case-picker";
import { NewNoteForm } from "./new-note-form";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const EVENT_STYLE: Record<string, { dot: string; label: string }> = {
  cad: { dot: "bg-warn", label: "CAD" },
  osint: { dot: "bg-accent", label: "OSINT" },
  manual: { dot: "bg-slate-400", label: "Note" },
  assessment: { dot: "bg-ok", label: "Assessment" },
};

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: { case?: string };
}) {
  const supabase = createClient();
  const { data: cases } = await supabase.from("cases").select("*").order("title");
  const caseId = searchParams.case;

  const { data: events } = caseId
    ? await supabase
        .from("case_timeline")
        .select("*")
        .eq("case_id", caseId)
        .order("occurred_at", { ascending: false })
    : { data: null };

  return (
    <div>
      <PageHeader
        kicker="Chronological fusion"
        title="Unified timeline"
        description="CAD events and captured open-source evidence ordered in one analytic chronology."
        action={<CasePicker cases={cases ?? []} value={caseId} />}
      />

      {!caseId ? (
        <EmptyState
          icon={<TimelineIcon className="h-10 w-10" />}
          title="Choose a case"
          description="Pick a case above to see its fused CAD, OSINT, and manual chronology."
        />
      ) : (
        <div className="space-y-4">
          <NewNoteForm caseId={caseId} />

          {events?.length ? (
            <ol className="relative space-y-6 border-l border-base-700 pl-6">
              {events.map((e) => {
                const style = EVENT_STYLE[e.event_type] ?? EVENT_STYLE.manual;
                return (
                  <li key={`${e.event_type}-${e.id}`} className="relative">
                    <span
                      className={`absolute -left-[27px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-base-950 ${style.dot}`}
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{formatDateTime(e.occurred_at)}</span>
                      <span className="badge border border-base-600 bg-base-800 text-slate-300">
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-100">{e.title}</p>
                    {e.description && (
                      <p className="mt-0.5 text-sm text-slate-400">{e.description}</p>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="card text-sm text-slate-500">
              Nothing recorded for this case yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
