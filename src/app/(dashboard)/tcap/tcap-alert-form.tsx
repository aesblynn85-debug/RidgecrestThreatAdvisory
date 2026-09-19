"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addTcapAlert } from "@/lib/actions/tcap";
import { PlusIcon } from "@/components/icons";
import type { CaseRow, EntityRow } from "@/lib/supabase/types";

const ALERT_TYPES = ["content_alert", "account_alert", "url_alert", "other"] as const;
const SEVERITIES = ["low", "moderate", "high", "critical"] as const;

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
          <button type="submit" className="btn-primary" disabled={pending}>
  {pending ? "Logging…" : "Log alert"}
      </button>
    );
}

export function TcapAlertForm({ cases, entities }: { cases: CaseRow[]; entities: EntityRow[] }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
        return (
                <button className="btn-primary" onClick={() => setOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          Log a TCAP alert
        </button>
      );
}

  return (
        <div className="card w-full max-w-md">
      <p className="mb-4 text-sm font-medium text-slate-200">New TCAP alert</p>
            <form
        ref={formRef}
        action={async (formData) => {
                    setError(null);
                    const result = await addTcapAlert(formData);
                    if (result?.error) setError(result.error);
                    else {
                                  setOpen(false);
                                  formRef.current?.reset();
                    }
        }}
        className="space-y-3"
      >
        <div>
          <label className="label" htmlFor="title">
            Title *
                        </label>
          <input id="title" name="title" required className="input" placeholder="Flagged livestream re-upload" />
        </div>

                      <div className="grid grid-cols-2 gap-3">
          <div>
                    <label className="label" htmlFor="alert_type">
              Alert type
            </label>
                        <select id="alert_type" name="alert_type" className="input" defaultValue="content_alert">
                    {ALERT_TYPES.map((t) => (
                        <option key={t} value={t}>
                      {t}
                                      </option>
                          ))}
                        </select>
          </div>
          <div>
            <label className="label" htmlFor="severity">
                                    Severity
            </label>
            <select id="severity" name="severity" className="input" defaultValue="moderate">
          {SEVERITIES.map((s) => (
                              <option key={s} value={s}>
            {s}
                                          </option>
                          ))}
                        </select>
                        </div>
        </div>

        <div>
                                    <label className="label" htmlFor="summary">
            Summary
                      </label>
                        <textarea id="summary" name="summary" rows={3} className="input resize-none" />
        </div>

        <div>
                      <label className="label" htmlFor="source_url">
                                      Source URL
                      </label>
                        <input id="source_url" name="source_url" type="url" className="input" placeholder="https://" />
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
