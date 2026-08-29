// Thin wrapper around Perplexity's Sonar (search-grounded) chat completions
// API. Docs: https://docs.perplexity.ai/
// Server-only: reads PERPLEXITY_API_KEY, never call this from the client.

export interface SonarCitation {
  url: string;
  title?: string;
  snippet?: string;
}

export interface SonarResult {
  answer: string;
  citations: SonarCitation[];
  model: string;
}

const SYSTEM_PROMPT = `You are an open-source intelligence (OSINT) research assistant supporting a
licensed investigator. For the given lead, return a concise, factual summary
of what is publicly discoverable. Attribute claims to sources. Flag when
information could not be confirmed rather than guessing. Do not fabricate
details. This is for lawful investigative use (public-source leads only).`;

export async function runSonarSearch(
  query: string,
  opts: { model?: string } = {}
): Promise<SonarResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "PERPLEXITY_API_KEY is not set. Add it to your environment (see .env.local.example) to enable Live OSINT search."
    );
  }

  const model = opts.model || "sonar";

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      temperature: 0.2,
    }),
    // Sonar searches can take a few seconds; give it room.
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Perplexity API error (${response.status}): ${body || response.statusText}`
    );
  }

  const data = await response.json();
  const answer: string = data?.choices?.[0]?.message?.content ?? "";

  // Perplexity's response shape has evolved between a plain `citations: string[]`
  // and a richer `search_results: {title, url, date}[]` — support both.
  let citations: SonarCitation[] = [];
  if (Array.isArray(data?.search_results)) {
    citations = data.search_results.map((r: any) => ({
      url: r.url,
      title: r.title,
      snippet: r.snippet,
    }));
  } else if (Array.isArray(data?.citations)) {
    citations = data.citations.map((url: string) => ({ url }));
  }

  return { answer, citations, model };
}
