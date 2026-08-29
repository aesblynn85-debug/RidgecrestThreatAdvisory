"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { runSonarSearch, type SonarCitation } from "@/lib/perplexity";
import { logAction } from "./audit";

export interface OsintSearchState {
  error?: string;
  answer?: string;
  citations?: SonarCitation[];
  query?: string;
}

export async function searchOsint(query: string): Promise<OsintSearchState> {
  const trimmed = query.trim();
  if (!trimmed) return { error: "Enter a search lead first." };

  try {
    const result = await runSonarSearch(trimmed);
    return { answer: result.answer, citations: result.citations, query: trimmed };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Search failed." };
  }
}

export async function saveOsintResult(input: {
  query: string;
  answer: string;
  citations: SonarCitation[];
  case_id?: string | null;
  entity_id?: string | null;
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
    model: "sonar",
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  await logAction(`Saved OSINT result for "${input.query}"`, input.case_id ?? undefined);
  revalidatePath("/osint");
  if (input.case_id) revalidatePath(`/cases/${input.case_id}`);
  return { error: null };
}
