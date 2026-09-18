#!/usr/bin/env python3
"""
Runs a DuckDuckGo text search using the `duckduckgo-search` Python library
and prints the results as JSON on stdout, so src/lib/duckduckgo.ts can spawn
this script and parse its output. Kept as a one-shot script (rather than a
long-running service) so there is no extra process to manage -- one query
in, one JSON blob out.

Install:  pip install -r requirements.txt
Usage:    python3 scripts/ddg_search.py "query text" [max_results]
"""
import json
import sys


def main() -> None:
      if len(sys.argv) < 2:
                print(json.dumps({"error": "Usage: ddg_search.py <query> [max_results]"}))
                sys.exit(1)

      query = sys.argv[1]
      max_results = int(sys.argv[2]) if len(sys.argv) > 2 else 10

    try:
              from duckduckgo_search import DDGS
except ImportError:
          print(json.dumps({
                        "error": "The duckduckgo-search package is not installed. Run: pip install -r requirements.txt"
          }))
          sys.exit(1)

    try:
              with DDGS() as ddgs:
                            results = list(ddgs.text(query, max_results=max_results))
    except Exception as exc:  # surface any failure to the Node caller as JSON, not a traceback
              print(json.dumps({"error": str(exc)}))
              sys.exit(1)

    print(json.dumps({"results": results}))


if __name__ == "__main__":
      main()
  
