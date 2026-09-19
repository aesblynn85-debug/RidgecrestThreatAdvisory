import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/page-header";
import { FeedIcon } from "@/components/icons";
import { timeAgo } from "@/lib/format";
import { ThreatFeedForm } from "./threat-feed-form";
import { DeleteIndicatorButton } from "./delete-indicator-button";
import type { ThreatFeedSource } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const SOURCE_STYLES: Record<ThreatFeedSource, string> = {
    opencti: "bg-accent/10 text-accent border border-accent/30",
    misp: "bg-warn/10 text-warn border border-warn/30",
    other: "bg-base-700 text-slate-300",
};

export default async function ThreatFeedsPage() {
    const supabase = createClient();
    const [{ data: cases }, { data: entities }, { data: indicators }] = await Promise.all([
          supabase.from("cases").select("*").order("title"),
          supabase.from("entities").select("*").order("name"),
          supabase
            .from("threat_feed_indicators")
            .select("*, cases(title)")
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

  return (
        <div>
          <PageHeader
          kicker="Structured threat intelligence"
          title="OpenCTI / MISP Feeds"
          description="Log indicators of compromise sourced from the free, open-source OpenCTI and MISP threat-intel stack."
        />

      <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="card space-y-2 text-sm text-slate-400">
              <p className="text-sm font-medium text-slate-200">About this stack</p>
              <p>
                OpenCTI and MISP are free, open-source platforms for aggregating and sharing threat
                intelligence. This app does not sync with a live OpenCTI or MISP instance; use this
                section to keep a manually curated log of indicators pulled from your own deployment.
                              </p>
              <p>
                <a
                  className="text-accent underline"
                  href="https://opencti.io"
                  target="_blank"
                  rel="noreferrer"
                >
                  opencti.io
                </a> ·{" "}
                <a
                  className="text-accent underline"
                  href="https://github.com/OpenCTI-Platform/opencti"
                  target="_blank"
                  rel="noreferrer"
                >
                  OpenCTI on GitHub
                </a> ·{" "}
                <a
                  className="text-accent underline"
                  href="https://www.misp-project.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  misp-project.org
                </a> ·{" "}
                <a
                  className="text-accent underline"
                  href="https://github.com/MISP/MISP"
                  target="_blank"
                  rel="noreferrer"
                >
                  MISP on GitHub
                </a>
              </p>
            </div>

          <ThreatFeedForm cases={cases ?? []} entities={entities ?? []} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-slate-300">Indicator log</h2>
{indicators?.length ? (
              <div className="card divide-y divide-base-700 p-0">
  {indicators.map((i: any) => (
                    <div key={i.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                       <p className="font-mono text-sm font-medium text-slate-100">{i.value}</p>
                       <span className={`badge uppercase tracking-wide ${SOURCE_STYLES[i.source as ThreatFeedSource]}`}>
 {i.source}
                                            </span>
                   </div>
                   <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-slate-500">
                     <span>{i.indicator_type}</span>
                                            <span>·</span>
                     <span>{timeAgo(i.created_at)}</span>
 {i.cases?.title && (
                         <>
                           <span>·</span>
                          <span>{i.cases.title}</span>
                        </>
                      )}
                   </div>
 {i.description && <p className="mt-1.5 text-sm text-slate-400">{i.description}</p>}
 {i.tags?.length > 0 && (
                       <div className="mt-1.5 flex flex-wrap gap-1">
  {i.tags.map((tag: string) => (
                            <span key={tag} className="badge border border-base-600 bg-base-800 text-slate-300">
    {tag}
                            </span>
                          ))}
                      </div>
                    )}
                   <div className="mt-1.5 flex justify-end">
                     <DeleteIndicatorButton id={i.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
                        <EmptyState
                          icon={<FeedIcon className="h-8 w-8" />}
              title="No indicators logged yet"
              description="Log an indicator pulled from OpenCTI or MISP to tie it to a case or entity."
            />
          )}
        </div>
      </div>
    </div>
  );
}
