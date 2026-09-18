// Fallback OSINT search engine for the Live OSINT tab: shells out to
// scripts/ddg_search.py, which uses the `duckduckgo-search` Python library
// (see requirements.txt), and parses its JSON stdout.
//
// This requires a Python 3 interpreter with `duckduckgo-search` installed to
// be available on the machine running the Next.js server. That's true for a
// self-hosted Node server, a VM, or a Docker image you build yourself -- it
// is NOT true for Vercel's default serverless functions, which don't ship a
// Python runtime and don't let you spawn arbitrary system binaries. If you
// deploy to Vercel, either rely on SearXNG only (this fallback will simply
// report itself unavailable) or move the app to a host that gives you a real
// long-lived process (a small VM, Fly.io, Render, Railway, or a self-hosted
// Docker container).

import { spawn } from "node:child_process";
import path from "node:path";

export interface DdgCitation {
    url: string;
    title?: string;
    snippet?: string;
}

export interface DdgResult {
    answer: string;
    citations: DdgCitation[];
    model: string;
}

function runPython(query: string): Promise<string> {
    const pythonBin = process.env.PYTHON_BIN || "python3";
    const scriptPath = path.join(process.cwd(), "scripts", "ddg_search.py");

  return new Promise((resolve, reject) => {
        const child = spawn(pythonBin, [scriptPath, query, "10"], {
                timeout: 45_000,
        });

                         let stdout = "";
        let stderr = "";
        child.stdout.on("data", (chunk) => (stdout += chunk));
        child.stderr.on("data", (chunk) => (stderr += chunk));

                         child.on("error", (err) => {
                                 reject(
                                           new Error(
                                                       `Could not start "${pythonBin}" (${err.message}). Is Python 3 installed and on PATH? See requirements.txt.`
                                                     )
                                         );
                         });

                         child.on("close", (code) => {
                                 if (code !== 0 && !stdout.trim()) {
                                           reject(new Error(stderr || `ddg_search.py exited with code ${code}`));
                                           return;
                                 }
                                 resolve(stdout);
                         });
  });
}

export async function runDuckDuckGoSearch(query: string): Promise<DdgResult> {
    const stdout = await runPython(query);

  let parsed: any;
    try {
          const lastLine = stdout.trim().split("\n").pop() || "{}";
          parsed = JSON.parse(lastLine);
    } catch {
          throw new Error(`Unexpected output from ddg_search.py: ${stdout.slice(0, 200)}`);
    }

  if (parsed.error) throw new Error(parsed.error);

  const rawResults: any[] = Array.isArray(parsed.results) ? parsed.results : [];
    const citations: DdgCitation[] = rawResults.slice(0, 10).map((r) => ({
          url: r.href || r.url,
          title: r.title,
          snippet: r.body,
    }));

  const answer = citations.length
      ? citations
            .slice(0, 5)
            .map((c) => `- ${c.title || c.url}${c.snippet ? " -- " + c.snippet : ""}`)
            .join("\n")
        : "No results found for this lead.";

  return { answer, citations, model: "duckduckgo" };
}
