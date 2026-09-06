"use client";

import { useState } from "react";
import { syncCadFromSource } from "@/lib/actions/cad";
import { RefreshIcon } from "@/components/icons";

export function CadSyncButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        className="btn-secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMessage(null);
          const res = await syncCadFromSource();
          setBusy(false);
          if (res?.error) setMessage({ ok: false, text: res.error });
          else setMessage({ ok: true, text: `Synced ${res.imported} record(s).` });
        }}
      >
        <RefreshIcon className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
        {busy ? "Syncing…" : "Sync from CAD"}
      </button>
      {message && (
        <span className={`text-xs ${message.ok ? "text-ok" : "text-danger"}`}>
          {message.text}
        </span>
      )}
    </div>
  );
}
