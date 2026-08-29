"use client";

import { useState } from "react";
import { updateCaseSummary } from "@/lib/actions/cases";

export function CaseSummaryForm({
  caseId,
  summary,
}: {
  caseId: string;
  summary: string | null;
}) {
  const [value, setValue] = useState(summary ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = value !== (summary ?? "");

  return (
    <div>
      <textarea
        className="input min-h-[100px] resize-y"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        placeholder="What is this case about? Update as the picture develops."
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          className="btn-secondary py-1.5 text-xs"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            await updateCaseSummary(caseId, value);
            setSaving(false);
            setSaved(true);
          }}
        >
          {saving ? "Saving…" : "Save summary"}
        </button>
        {saved && !dirty && (
          <span className="text-xs text-ok">Saved</span>
        )}
      </div>
    </div>
  );
}
