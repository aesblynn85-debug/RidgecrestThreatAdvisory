"use client";

import { useRef, useState } from "react";
import { importCadCsv } from "@/lib/actions/cad";
import { UploadIcon } from "@/components/icons";
import type { CaseRow } from "@/lib/supabase/types";

export function CadImportForm({ cases }: { cases: CaseRow[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button className="btn-secondary" onClick={() => setOpen(true)}>
        <UploadIcon className="h-4 w-4" />
        Import CSV
      </button>
    );
  }

  return (
    <div className="card w-full max-w-md">
      <p className="mb-1 text-sm font-medium text-slate-200">Import CAD records</p>
      <p className="mb-4 text-xs text-slate-500">
        Columns recognized: external_id, record_type, occurred_at, narrative,
        location. Anything else is kept as raw detail.
      </p>
      <form
        ref={formRef}
        action={async (formData) => {
          setBusy(true);
          setMessage(null);
          const res = await importCadCsv(formData);
          setBusy(false);
          if (res?.error) setMessage({ ok: false, text: res.error });
          else {
            setMessage({ ok: true, text: `Imported ${res.imported} record(s).` });
            formRef.current?.reset();
          }
        }}
        className="space-y-3"
      >
        <div>
          <label className="label" htmlFor="file">
            CSV file
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="input file:mr-3 file:rounded-md file:border-0 file:bg-base-700 file:px-3 file:py-1.5 file:text-xs file:text-slate-200"
          />
        </div>
        <div>
          <label className="label" htmlFor="case_id">
            Attach to case (optional)
          </label>
          <select id="case_id" name="case_id" className="input" defaultValue="">
            <option value="">Unassigned — sort into cases later</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              message.ok
                ? "border-ok/30 bg-ok/10 text-ok"
                : "border-danger/30 bg-danger/10 text-danger"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Importing…" : "Import"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      </form>
    </div>
  );
}
