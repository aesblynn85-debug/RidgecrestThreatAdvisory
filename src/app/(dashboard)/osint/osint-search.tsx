"use client";

import { useState } from "react";
import { searchOsint, saveOsintResult, type OsintSearchState } from "@/lib/actions/osint";
import { SearchIcon, OsintIcon } from "@/components/icons";
import type { CaseRow, EntityRow } from "@/lib/supabase/types";

export function OsintSearch({
  cases,
  entities,
  defaultCaseId,
}: {
  cases: CaseRow[];
  entities: EntityRow[];
  defaultCaseId?: string;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<OsintSearchState | null>(null);
  const [searching, setSearching] = useState(false);
  const [caseId, setCaseId] = useState(defaultCaseId || "");
  const [entityId, setEntityId] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function runSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setSaveState("idle");
    const res = await searchOsint(query);
    setResult(res);
    setSearching(false);
  }

  return (
    <div>
      <div className="card">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Person, organization, domain, address, phone, username…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
            />
          </div>
          <button className="btn-primary shrink-0" onClick={runSearch} disabled={searching}>
            {searching ? "Searching…" : (
              <>
                <OsintIcon className="h-4 w-4" /> Search web
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Searches run server-side via SerpAPI (Google Search). Results are public-source leads, not verified facts.
        </p>
      </div>

      {result?.error && (
        <p className="card mt-4 border-danger/30 bg-danger/10 text-sm text-danger">
          {result.error}
        </p>
      )}

      {result?.answer && (
        <div className="card mt-4">
          <p className="kicker">Result for “{result.query}”</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
            {result.answer}
          </p>

          {result.citations && result.citations.length > 0 && (
            <div className="mt-4 border-t border-base-700 pt-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                Sources ({result.citations.length})
              </p>
              <ul className="space-y-1.5">
                {result.citations.map((c, i) => (
                  <li key={i} className="text-xs">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {c.title || c.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-base-700 pt-3">
            <select
              className="input w-auto text-xs"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            >
              <option value="">No case</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <select
              className="input w-auto text-xs"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
            >
              <option value="">No entity</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <button
              className="btn-secondary text-xs"
              disabled={saveState === "saving"}
              onClick={async () => {
                setSaveState("saving");
                const res = await saveOsintResult({
                  query: result.query!,
                  answer: result.answer!,
                  citations: result.citations || [],
                  case_id: caseId || null,
                  entity_id: entityId || null,
                });
                setSaveState(res?.error ? "error" : "saved");
              }}
            >
              {saveState === "saving" ? "Saving…" : "Save to case"}
            </button>
            {saveState === "saved" && <span className="text-xs text-ok">Saved</span>}
            {saveState === "error" && <span className="text-xs text-danger">Failed to save</span>}
          </div>
        </div>
      )}
    </div>
  );
}
