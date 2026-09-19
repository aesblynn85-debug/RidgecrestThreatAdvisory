"use client";

import { useState } from "react";
import { deleteThreatFeedIndicator } from "@/lib/actions/threat-feeds";

export function DeleteIndicatorButton({ id }: { id: string }) {
    const [busy, setBusy] = useState(false);

  return (
        <button
          type="button"
          className="text-xs text-slate-500 hover:text-danger disabled:opacity-50"
        disabled={busy}
        onClick={async () => {
                  if (!confirm("Delete this indicator? This cannot be undone.")) return;
                  setBusy(true);
                  await deleteThreatFeedIndicator(id);
                  setBusy(false);
        }}
      >
  {busy ? "Deleting…" : "Delete"}
      </button>
    );
}
