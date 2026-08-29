"use client";

import { useRef, useState } from "react";
import { addTimelineNote } from "@/lib/actions/timeline";

export function NewNoteForm({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button className="btn-secondary" onClick={() => setOpen(true)}>
        + Add manual entry
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setError(null);
        const res = await addTimelineNote(formData);
        if (res?.error) setError(res.error);
        else {
          setOpen(false);
          formRef.current?.reset();
        }
      }}
      className="card space-y-3"
    >
      <input type="hidden" name="case_id" value={caseId} />
      <div className="grid grid-cols-[1fr,220px] gap-3">
        <input name="title" required className="input" placeholder="What happened?" />
        <input name="occurred_at" type="datetime-local" className="input" />
      </div>
      <textarea name="description" rows={2} className="input resize-none" placeholder="Details (optional)" />
      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          Add to timeline
        </button>
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
