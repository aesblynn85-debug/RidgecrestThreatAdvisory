"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { runSearxngSearch } from "@/lib/searxng";
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

    // SearXNG is the sole Live OSINT engine (self-hosted, no per-query cost or key).
    try {
                const result = await runSearxngSearch(trimmed);
                return {
                                answer: result.answer,
                                citations: result.citations,
                                query: trimmed,
                                engine: result.model,
                };
    } catch (searxError) {
                const searxMsg = searxError instanceof Error ? searxError.message : "SearXNG failed.";
                return { error: `SearXNG: ${searxMsg}` };
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
