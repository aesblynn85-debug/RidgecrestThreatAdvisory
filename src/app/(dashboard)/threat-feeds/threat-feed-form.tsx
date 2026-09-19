"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addThreatFeedIndicator } from "@/lib/actions/threat-feeds";
import { PlusIcon } from "@/components/icons";
import type { CaseRow, EntityRow } from "@/lib/supabase/types";

const SOURCES = ["opencti", "misp", "other"] as const;
const INDICATOR_TYPES = ["ip", "domain", "url", "hash", "email", "other"] as const;

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
          <button type="submit" className="btn-primary" disabled={pending}>
  {pending ? "Logging…" : "Log indicator"}
      </button>
    );
}

export function ThreatFeedForm({ cases, entities }: { cases: CaseRow[]; entities: EntityRow[] }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
        return (
                <button className="btn-primary" onClick={() => setOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          Log an indicator
          </button>
      );
}

  return (
        <div className="card w-full max-w-md">
      <p className="mb-4 text-sm font-medium text-slate-200">New threat feed indicator</p>
            <form
        ref={formRef}
        action={async (formData) => {
                    setError(null);
                    const result = await addThreatFeedIndicator(formData);
                    if (result?.error) setError(result.error);
                    else {
                                  setOpen(false);
                                  formRef.current?.reset();
                    }
        }}
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="source">
              Source
            </label>
            <select id="source" name="source" className="input" defaultValue="misp">
{SOURCES.map((s) => (
                              <option key={s} value={s}>
  {s}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="indicator_type">
              Indicator type
                          </label>
            <select id="indicator_type" name="indicator_type" className="input" defaultValue="ip">
{INDICATOR_TYPES.map((t) => (
                  <option key={t} value={t}>
  {t}
                              </option>
                            ))}
            </select>
          </div>
                      </div>

                      <div>
          <label className="label" htmlFor="value">
            Value *
                        </label>
          <input id="value" name="value" required className="input" placeholder="203.0.113.42" />
        </div>

          <div>
          <label className="label" htmlFor="description">
                          Description
                </label>
            <textarea id="description" name="description" rows={3} className="input resize-none" />
                    </div>

        <div>
          <label className="label" htmlFor="tags">
            Tags
          </label>
                      <input id="tags" name="tags" className="input" placeholder="comma, separated, tags" />
        </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
            <label className="label" htmlFor="case_id">
              Case
                          </label>
                        <select id="case_id" name="case_id" className="input" defaultValue="">
                            <option value="">None</option>
          {cases.map((c) => (
                            <option key={c.id} value={c.id}>
          {c.title}
                              </option>
                ))}
                                 </select>
                </div>
                                                                <div>
                        <label className="label" htmlFor="entity_id">
                          Entity
                        </label>
              <select id="entity_id" name="entity_id" className="input" defaultValue="">
              <option value="">None</option>
{entities.map((e) => (
                  <option key={e.id} value={e.id}>
{e.name}
                </option>
              ))}
            </select>
          </div>
        </div>

{error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
 {error}
           </p>
         )}

        <div className="flex gap-2 pt-1">
          <SubmitButton />
          <button
                            type="button"
            className="btn-secondary"
            onClick={() => {
                            setOpen(false);
                            setError(null);
                            formRef.current?.reset();
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
