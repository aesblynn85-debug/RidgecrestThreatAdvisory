"use client";

import { useRef, useState } from "react";
import { linkEntityToCase } from "@/lib/actions/cases";
import { createEntity } from "@/lib/actions/entities";
import type { EntityRow, EntityType } from "@/lib/supabase/types";

const ENTITY_TYPES: EntityType[] = [
  "person",
  "organization",
  "vehicle",
  "domain",
  "location",
  "identifier",
  "infrastructure",
  "other",
];

export function LinkEntityForm({
  caseId,
  candidates,
}: {
  caseId: string;
  candidates: EntityRow[];
}) {
  const [mode, setMode] = useState<"existing" | "new">(
    candidates.length ? "existing" : "new"
  );
  const [selected, setSelected] = useState(candidates[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="card">
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          className={`btn-ghost px-2 py-1 text-xs ${mode === "existing" ? "bg-base-800 text-white" : ""}`}
          onClick={() => setMode("existing")}
          disabled={!candidates.length}
        >
          Link existing
        </button>
        <button
          type="button"
          className={`btn-ghost px-2 py-1 text-xs ${mode === "new" ? "bg-base-800 text-white" : ""}`}
          onClick={() => setMode("new")}
        >
          Create new
        </button>
      </div>

      {mode === "existing" ? (
        candidates.length ? (
          <div className="flex gap-2">
            <select
              className="input"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {candidates.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.entity_type})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-primary shrink-0"
              disabled={busy || !selected}
              onClick={async () => {
                setBusy(true);
                setError(null);
                const res = await linkEntityToCase(caseId, selected);
                if (res?.error) setError(res.error);
                setBusy(false);
              }}
            >
              {busy ? "Linking…" : "Link"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No unlinked entities yet — create one instead.
          </p>
        )
      ) : (
        <form
          ref={formRef}
          action={async (formData) => {
            setBusy(true);
            setError(null);
            formData.set("case_id", caseId);
            const res = await createEntity(formData);
            if (res?.error) setError(res.error);
            else formRef.current?.reset();
            setBusy(false);
          }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <input
              name="name"
              required
              placeholder="Entity name"
              className="input"
            />
            <select name="entity_type" className="input w-40 shrink-0" defaultValue="person">
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="attributes"
            rows={2}
            placeholder={"Attributes, one per line, e.g.\nphone: 555-0134"}
            className="input resize-none font-mono text-xs"
          />
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Adding…" : "Add & link to case"}
          </button>
        </form>
      )}

      {error && (
        <p className="mt-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
