"use client";

import { useTransition } from "react";
import { setAssessmentStatus } from "@/lib/actions/assessments";
import type { AssessmentStatus } from "@/lib/supabase/types";

export function StatusToggle({
  assessmentId,
  status,
}: {
  assessmentId: string;
  status: AssessmentStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className={status === "final" ? "btn-secondary" : "btn-primary"}
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          setAssessmentStatus(assessmentId, status === "final" ? "draft" : "final");
        })
      }
    >
      {pending ? "Updating…" : status === "final" ? "Revert to draft" : "Mark final"}
    </button>
  );
}
