"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { runSearxngSearch } from "@/lib/searxng";
import { runDuckDuckGoSearch } from "@/lib/duckduckgo";
import type { OsintCitation } from "@/lib/supabase/types";
import { logAction } from "./audit";

export interface OsintSearchState {
    error?: string;
    answer?: string;
    citations?: OsintCitation[];
    query?: string;
    engine?: string;
}

export async function searchOsint(query: string): Promise<OsintSearchState> {
    const trimmed = query.trim();
    if (!trimmed) return { error: "Enter a search lead first." };

  // SearXNG is the primary engine (self-hosted, no per-query cost or key).
  // If it's not configured or the request fails, fall back to the
  // DuckDuckGo Python library (src/lib/duckduckgo.ts) before giving up.
  try {
        const result = await runSearxngSearch(trimmed);
        return {
                answer: result.answer,
                citations: result.citations,
                query: trimmed,
                engine: result.model,
        };
  } catch (searxError) {
        try {
                const result = await runDuckDuckGoSearch(trimmed);
                return {
                          answer: result.answer,
                          citations: result.citations,
                          query: trimmed,
                          engine: result.model,
                };
        } catch (ddgError) {
                const searxMsg = searxError instanceof Error ? searxError.message : "SearXNG failed.";
                const ddgMsg = ddgError instanceof Error ? ddgError.message : "DuckDuckGo failed.";
                return { error: `SearXNG: ${searxMsg} | DuckDuckGo: ${ddgMsg}` };
        }
  }
}

export async function saveOsintResult(input: {
    query: string;
    answer: string;
    citations: OsintCitation[];
    case_id?: string | null;
    entity_id?: string | null;
    engine?: string;
}) {
    const supabase = createClient();
    const {
          data: { user },
    } = await supabase.auth.getUser();

  const { error } = await supabase.from("osint_results").insert({
        query: input.query,
        answer: input.answer,
        citations: input.citations,
        case_id: input.case_id || null,
        entity_id: input.entity_id || null,
        model: input.engine || "searxng",
        created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  await logAction(`Saved OSINT result for "${input.query}"`, input.case_id ?? undefined);
    revalidatePath("/osint");
    if (input.case_id) revalidatePath(`/cases/${input.case_id}`);
    return { error: null };
}
