"use client";

import { useState } from "react";
import { updateOrgSettings, triggerManualSync } from "@/lib/actions/settings";
import { RefreshIcon } from "@/components/icons";
import type { OrgSettingsRow } from "@/lib/supabase/types";
import { formatDateTime } from "@/lib/format";

export function SettingsForm({ settings }: { settings: OrgSettingsRow }) {
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(settings.last_cad_sync_at);

  return (
    <div className="space-y-6">
      <form
        action={async (formData) => {
          setSaved(false);
          await updateOrgSettings(formData);
          setSaved(true);
        }}
        className="card space-y-4"
      >
        <p className="text-sm font-medium text-slate-200">Session & sign-in</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="session_timeout_hours">
              Session expiration (hours)
            </label>
            <input
              id="session_timeout_hours"
              name="session_timeout_hours"
              type="number"
              min={1}
              max={168}
              defaultValue={settings.session_timeout_hours}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="sign_in_throttle_seconds">
              Sign-in throttle (seconds)
            </label>
            <input
              id="sign_in_throttle_seconds"
              name="sign_in_throttle_seconds"
              type="number"
              min={0}
              max={600}
              defaultValue={settings.sign_in_throttle_seconds}
              className="input"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="cad_sync_enabled"
            defaultChecked={settings.cad_sync_enabled}
            className="h-4 w-4 rounded border-base-600 bg-base-900 text-accent"
          />
          CAD ingestion enabled (CSV import & webhook)
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary">
            Save settings
          </button>
          {saved && <span className="text-xs text-ok">Saved</span>}
        </div>
      </form>

      <div className="card">
        <p className="text-sm font-medium text-slate-200">CAD ingestion</p>
        <p className="mt-1 text-sm text-slate-400">
          Last sync: {formatDateTime(lastSync)}
        </p>
        <button
          className="btn-secondary mt-3"
          disabled={syncing}
          onClick={async () => {
            setSyncing(true);
            await triggerManualSync();
            setLastSync(new Date().toISOString());
            setSyncing(false);
          }}
        >
          <RefreshIcon className="h-4 w-4" />
          {syncing ? "Syncing…" : "Run sync check"}
        </button>
      </div>
    </div>
  );
}
