// Thin wrapper around a self-hosted (or trusted) SearXNG instance's JSON
// search API for the Live OSINT tab. Docs: https://docs.searxng.org/dev/search_api.html
// Server-only: reads SEARXNG_URL, never call this from the client.
//
// SearXNG's JSON output format must be enabled on the instance you point
// this at -- add "- json" under "search: formats:" in that instance's
// settings.yml (most public instances disable it for anti-scraping reasons,
// so this generally requires an instance you run yourself).

export interface SearxCitation {
    url: string;
    title?: string;
    snippet?: string;
}

export interface SearxResult {
    answer: string;
    citations: SearxCitation[];
    model: string;
}

export async function runSearxngSearch(query: string): Promise<SearxResult> {
    const baseUrl = process.env.SEARXNG_URL;
    if (!baseUrl) {
          throw new Error(
                  "SEARXNG_URL is not set. Add it to your environment (see .env.local.example) to enable SearXNG search."
                );
    }

  const params = new URLSearchParams({ q: query, format: "json" });

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/search?${params.toString()}`, {
        method: "GET",
        signal: AbortSignal.timeout(45_000),
        headers: { Accept: "application/json" },
  });

  if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`SearXNG error (${response.status}): ${body || response.statusText}`);
  }

  const data = await response.json();

  const citations: SearxCitation[] = Array.isArray(data?.results)
      ? data.results.slice(0, 10).map((r: any) => ({
                url: r.url,
                title: r.title,
                snippet: r.content,
      }))
        : [];

  const infobox = Array.isArray(data?.infoboxes) ? data.infoboxes[0] : null;
    const answerFromApi =
          Array.isArray(data?.answers) && data.answers.length ? String(data.answers[0]) : "";

  let answer = "";
    if (answerFromApi) answer = answerFromApi;
    else if (infobox?.content) answer = String(infobox.content);
    else if (citations.length) {
          answer = citations
            .slice(0, 5)
            .map((c) => `- ${c.title || c.url}${c.snippet ? " -- " + c.snippet : ""}`)
            .join("\n");
    } else {
          answer = "No results found for this lead.";
    }

  return { answer, citations, model: "searxng" };
}
