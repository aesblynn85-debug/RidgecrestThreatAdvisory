"use client";

import { useState } from "react";
import type { AssessmentRow } from "@/lib/supabase/types";
import { EditAssessmentForm } from "./edit-assessment-form";
import { BriefView } from "./brief-view";

export function AssessmentTabs({
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
  const [tab, setTab] = useState<"edit" | "brief">("edit");

  return (
    <div>
      <div className="mb-6 flex gap-1 print:hidden">
        <button
          className={`btn-ghost text-sm ${tab === "edit" ? "bg-base-800 text-white" : ""}`}
          onClick={() => setTab("edit")}
        >
          Edit
        </button>
        <button
          className={`btn-ghost text-sm ${tab === "brief" ? "bg-base-800 text-white" : ""}`}
          onClick={() => setTab("brief")}
        >
          Client brief
        </button>
      </div>

      {tab === "edit" ? (
        <EditAssessmentForm assessment={assessment} />
      ) : (
        <BriefView
          assessment={assessment}
          caseTitle={caseTitle}
          clientName={clientName}
          orgName={orgName}
        />
      )}
    </div>
  );
}
