"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createEntity } from "@/lib/actions/entities";
import { PlusIcon } from "@/components/icons";
import type { EntityType } from "@/lib/supabase/types";

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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Adding…" : "Add entity"}
    </button>
  );
}

export function NewEntityForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4" />
        Add entity
      </button>
    );
  }

  return (
    <div className="card w-full max-w-md">
      <p className="mb-4 text-sm font-medium text-slate-200">New entity</p>
      <form
        ref={formRef}
        action={async (formData) => {
          setError(null);
          const result = await createEntity(formData);
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
            <label className="label" htmlFor="name">
              Name *
            </label>
            <input id="name" name="name" required className="input" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="label" htmlFor="entity_type">
              Type
            </label>
            <select id="entity_type" name="entity_type" className="input" defaultValue="person">
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="attributes">
            Attributes
          </label>
          <textarea
            id="attributes"
            name="attributes"
            rows={3}
            className="input resize-none font-mono text-xs"
            placeholder={"one per line, e.g.\nphone: 555-0134\nemployer: Acme Corp"}
          />
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Notes
          </label>
          <textarea id="notes" name="notes" rows={2} className="input resize-none" />
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
