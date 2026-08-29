"use client";

import { useState } from "react";
import { updateAssessment } from "@/lib/actions/assessments";
import type { AssessmentRow } from "@/lib/supabase/types";

export function EditAssessmentForm({ assessment }: { assessment: AssessmentRow }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={async (formData) => {
        setError(null);
        setSaved(false);
        const res = await updateAssessment(assessment.id, formData);
        if (res?.error) setError(res.error);
        else setSaved(true);
      }}
      className="card space-y-4"
    >
      <div>
        <label className="label" htmlFor="title">
          Title
        </label>
        <input id="title" name="title" required defaultValue={assessment.title} className="input" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="threat_level">
            Threat level
          </label>
          <select id="threat_level" name="threat_level" className="input" defaultValue={assessment.threat_level}>
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
          <select id="confidence_level" name="confidence_level" className="input" defaultValue={assessment.confidence_level}>
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
        <textarea id="summary" name="summary" rows={4} className="input resize-y" defaultValue={assessment.summary || ""} />
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
          defaultValue={(assessment.indicators || []).join("\n")}
        />
      </div>

      <div>
        <label className="label" htmlFor="gaps">
          Intelligence gaps
        </label>
        <textarea id="gaps" name="gaps" rows={2} className="input resize-y" defaultValue={assessment.gaps || ""} />
      </div>

      <div>
        <label className="label" htmlFor="recommendations">
          Recommendations
        </label>
        <textarea
          id="recommendations"
          name="recommendations"
          rows={2}
          className="input resize-y"
          defaultValue={assessment.recommendations || ""}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary">
          Save changes
        </button>
        {saved && <span className="text-xs text-ok">Saved</span>}
      </div>
    </form>
  );
}
