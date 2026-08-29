"use client";

import type { AssessmentRow } from "@/lib/supabase/types";
import { formatDate } from "@/lib/format";

export function BriefView({
  assessment,
  caseTitle,
  clientName,
  orgName,
}: {
  assessment: AssessmentRow;
  caseTitle?: string | null;
  clientName?: string | null;
  orgName: string;
}) {
  return (
    <div>
      <div className="mb-4 flex justify-end print:hidden">
        <button className="btn-primary" onClick={() => window.print()}>
          Print / save as PDF
        </button>
      </div>

      <div className="card bg-white text-slate-900 print:border-0 print:bg-white print:p-0 print:shadow-none">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {orgName}
            </p>
            <h1 className="mt-1 text-xl font-semibold">{assessment.title}</h1>
            {caseTitle && <p className="mt-0.5 text-sm text-slate-500">Case: {caseTitle}</p>}
            {clientName && <p className="text-sm text-slate-500">Prepared for: {clientName}</p>}
          </div>
          <div className="text-right text-sm">
            <p className="font-medium uppercase">{assessment.threat_level}</p>
            <p className="text-slate-500">{assessment.confidence_level} confidence</p>
            <p className="mt-1 text-xs text-slate-400">
              {assessment.status === "final" ? "Final" : "Draft"} ·{" "}
              {formatDate(assessment.finalized_at || assessment.created_at)}
            </p>
          </div>
        </div>

        <Section title="Summary judgment" body={assessment.summary} />

        {assessment.indicators?.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Indicators
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {assessment.indicators.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>
        )}

        <Section title="Intelligence gaps" body={assessment.gaps} />
        <Section title="Recommendations" body={assessment.recommendations} />

        <p className="mt-8 border-t border-slate-200 pt-3 text-xs text-slate-400">
          This assessment reflects information available as of the date above and is based on
          public-source and CAD-derived intelligence. It is not a guarantee of future events.
        </p>
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string | null }) {
  if (!body) return null;
  return (
    <div className="mt-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
    </div>
  );
}
