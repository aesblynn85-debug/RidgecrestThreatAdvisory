"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createAssessment } from "@/lib/actions/assessments";
import type { CaseRow } from "@/lib/supabase/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saving…" : "Save draft"}
    </button>
  );
}

export function NewAssessmentForm({
  cases,
  defaultCaseId,
}: {
  cases: CaseRow[];
  defaultCaseId?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        const res = await createAssessment(formData);
        if (res?.error) setError(res.error);
      }}
      className="card max-w-2xl space-y-4"
    >
      <div>
        <label className="label" htmlFor="title">
          Title *
        </label>
        <input id="title" name="title" required className="input" placeholder="ShieldTec digital footprint" />
      </div>

      <div>
        <label className="label" htmlFor="case_id">
          Case
        </label>
        <select id="case_id" name="case_id" className="input" defaultValue={defaultCaseId || ""}>
          <option value="">Not tied to a case</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="threat_level">
            Threat level
          </label>
          <select id="threat_level" name="threat_level" className="input" defaultValue="guarded">
            <option value="low">Low</option>
            <option value="guarded">Guarded</option>
            <option value="elevated">Elevated</option>
            <option value="high">High</option>
            <option value="severe">Severe</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="confidence_level">
            Confidence
          </label>
          <select id="confidence_level" name="confidence_level" className="input" defaultValue="moderate">
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="summary">
          Summary judgment
        </label>
        <textarea id="summary" name="summary" rows={4} className="input resize-y" placeholder="What do we assess, and why?" />
      </div>

      <div>
        <label className="label" htmlFor="indicators">
          Indicators (one per line)
        </label>
        <textarea
          id="indicators"
          name="indicators"
          rows={3}
          className="input resize-y font-mono text-xs"
          placeholder={"Repeated site visits after being told to leave\nUse of alias when contacting front desk"}
        />
      </div>

      <div>
        <label className="label" htmlFor="gaps">
          Intelligence gaps
        </label>
        <textarea id="gaps" name="gaps" rows={2} className="input resize-y" placeholder="What don't we know yet?" />
      </div>

      <div>
        <label className="label" htmlFor="recommendations">
          Recommendations
        </label>
        <textarea id="recommendations" name="recommendations" rows={2} className="input resize-y" placeholder="Protective actions for the client" />
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
