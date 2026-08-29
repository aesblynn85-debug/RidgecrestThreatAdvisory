"use client";

import { useRef, useState } from "react";
import { createEntityLink } from "@/lib/actions/links";
import type { EntityRow } from "@/lib/supabase/types";

export function NewLinkForm({
  caseId,
  entities,
}: {
  caseId: string;
  entities: EntityRow[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setBusy(true);
        setError(null);
        const res = await createEntityLink(formData);
        setBusy(false);
        if (res?.error) setError(res.error);
        else formRef.current?.reset();
      }}
      className="card space-y-3"
    >
      <input type="hidden" name="case_id" value={caseId} />
      <p className="text-sm font-medium text-slate-200">Record a relationship</p>
      <div className="grid grid-cols-2 gap-3">
        <select name="from_entity_id" required className="input" defaultValue="">
          <option value="" disabled>
            Entity A
          </option>
          {entities.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <select name="to_entity_id" required className="input" defaultValue="">
          <option value="" disabled>
            Entity B
          </option>
          {entities.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          name="relationship_type"
          required
          className="input"
          placeholder="e.g. associate of, registered to, employed by"
        />
        <select name="confidence" className="input" defaultValue="moderate">
          <option value="low">Low confidence</option>
          <option value="moderate">Moderate confidence</option>
          <option value="high">High confidence</option>
          <option value="confirmed">Confirmed</option>
        </select>
      </div>
      <textarea name="notes" rows={2} className="input resize-none" placeholder="Supporting notes (optional)" />

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={busy || entities.length < 2}>
        {busy ? "Recording…" : "Record relationship"}
      </button>
      {entities.length < 2 && (
        <p className="text-xs text-slate-500">
          Link at least two entities to this case first.
        </p>
      )}
    </form>
  );
}
