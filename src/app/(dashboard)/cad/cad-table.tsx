"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { formatDateTime } from "@/lib/format";
import type { CadRecordRow } from "@/lib/supabase/types";

export function CadTable({ records }: { records: CadRecordRow[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const types = useMemo(
    () => Array.from(new Set(records.map((r) => r.record_type))).sort(),
    [records]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (type !== "all" && r.record_type !== type) return false;
      if (!q) return true;
      const haystack = [
        r.narrative,
        r.location,
        r.external_id,
        JSON.stringify(r.raw_data),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [records, query, type]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-9"
            placeholder="Search narratives, names, phones, plates, addresses…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All record types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="rounded-full border border-base-600 px-3 py-1 text-xs text-slate-400">
          {filtered.length} record{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="card text-sm text-slate-500">
          {records.length === 0
            ? "No records yet — import a CSV or connect the webhook."
            : "No records match that search."}
        </p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-base-700 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Record</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-700">
              {filtered.slice(0, 200).map((r) => (
                <tr key={r.id} className="align-top hover:bg-base-800/40">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                    {formatDateTime(r.occurred_at)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {r.external_id || r.id.slice(0, 8)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="badge border border-base-600 bg-base-800 text-slate-300">
                      {r.record_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {r.narrative || "—"}
                    {r.location && (
                      <span className="ml-2 text-xs text-slate-500">@ {r.location}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 200 && (
            <p className="border-t border-base-700 px-4 py-2 text-xs text-slate-500">
              Showing first 200 of {filtered.length} matches — narrow your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
