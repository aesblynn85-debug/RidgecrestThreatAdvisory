"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createCase } from "@/lib/actions/cases";
import { PlusIcon } from "@/components/icons";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Opening…" : "Open case"}
    </button>
  );
}

export function NewCaseForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4" />
        Open case
      </button>
    );
  }

  return (
    <div className="card w-full max-w-md">
      <p className="mb-4 text-sm font-medium text-slate-200">New case</p>
      <form
        ref={formRef}
        action={async (formData) => {
          setError(null);
          const result = await createCase(formData);
          if (result?.error) setError(result.error);
        }}
        className="space-y-3"
      >
        <div>
          <label className="label" htmlFor="title">
            Case title *
          </label>
          <input id="title" name="title" required className="input" placeholder="Unauthorized access — Ridgecrest Plaza" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="case_number">
              Case #
            </label>
            <input id="case_number" name="case_number" className="input" placeholder="2026-0142" />
          </div>
          <div>
            <label className="label" htmlFor="client_name">
              Client
            </label>
            <input id="client_name" name="client_name" className="input" placeholder="Acme Property Group" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="summary">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            className="input resize-none"
            placeholder="What triggered this case?"
          />
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
