// Thin wrapper around SerpAPI's Google Search endpoint for the Live OSINT
// tab. Docs: https://serpapi.com/search-api
// Server-only: reads SerpAPI_Key (falls back to SERPAPI_KEY), never call this from the client.
//
// The query is passed straight through as Google's `q` parameter, so
// standard Google search operators (site:, filetype:, intext:, inurl:,
// "exact phrase", -exclude, etc. -- i.e. "Google dorking") work exactly as
// they would on google.com.

export interface SerpCitation {
    url: string;
    title?: string;
    snippet?: string;
}

export interface SerpResult {
    answer: string;
    citations: SerpCitation[];
    model: string;
}

export async function runSerpApiSearch(query: string): Promise<SerpResult> {
    const apiKey = process.env.SerpAPI_Key || process.env.SERPAPI_KEY;
    if (!apiKey) {
          throw new Error(
                  "SerpAPI_Key is not set. Add it to your environment (see .env.local.example) to enable Live OSINT search."
                );
    }

  const params = new URLSearchParams({
        q: query,
        api_key: apiKey,
        engine: "google",
        num: "10",
  });

  const response = await fetch(`https://serpapi.com/search?${params.toString()}`, {
        method: "GET",
        signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`SerpAPI error (${response.status}): ${body || response.statusText}`);
  }

  const data = await response.json();

  const citations: SerpCitation[] = Array.isArray(data?.organic_results)
      ? data.organic_results.slice(0, 10).map((r: any) => ({
                url: r.link,
                title: r.title,
                snippet: r.snippet,
      }))
        : [];

  const answerBox = data?.answer_box;
    const knowledgeGraph = data?.knowledge_graph;

  let answer = "";
    if (answerBox?.answer) answer = String(answerBox.answer);
    else if (answerBox?.snippet) answer = String(answerBox.snippet);
    else if (knowledgeGraph?.description) answer = String(knowledgeGraph.description);
    else if (citations.length) {
          answer = citations
            .slice(0, 5)
            .map((c) => `- ${c.title || c.url}${c.snippet ? " -- " + c.snippet : ""}`)
            .join("\n");
    } else {
      answer = "No results found for this lead.";
    }

  return { answer, citations, model: "serpapi" };
}
