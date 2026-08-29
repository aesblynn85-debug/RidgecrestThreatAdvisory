"use client";

import { useTransition } from "react";
import { updateCaseStatus } from "@/lib/actions/cases";
import type { CaseStatus } from "@/lib/supabase/types";

const OPTIONS: { value: CaseStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "active", label: "Active" },
  { value: "pending_review", label: "Pending review" },
  { value: "closed", label: "Closed" },
];

export function CaseStatusForm({
  caseId,
  status,
}: {
  caseId: string;
  status: CaseStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="input w-auto py-1.5 text-sm"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value as CaseStatus;
        startTransition(() => {
          updateCaseStatus(caseId, value);
        });
      }}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
