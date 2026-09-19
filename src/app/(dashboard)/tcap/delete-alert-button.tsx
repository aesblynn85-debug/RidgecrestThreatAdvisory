"use client";

import { useState } from "react";
import { deleteTcapAlert } from "@/lib/actions/tcap";

export function DeleteAlertButton({ id }: { id: string }) {
    const [busy, setBusy] = useState(false);

  return (
        <button
                type="button"
                className="text-xs text-slate-500 hover:text-danger disabled:opacity-50"
                disabled={busy}
                onClick={async () => {
                          if (!confirm("Delete this alert log entry? This cannot be undone.")) return;
                          setBusy(true);
                          await deleteTcapAlert(id);
                          setBusy(false);
                }}
              >
          {busy ? "Deleting…" : "Delete"}
        </button>
    );
}
</button>
