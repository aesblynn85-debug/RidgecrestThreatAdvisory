import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/page-header";
import { AlertIcon } from "@/components/icons";
import { timeAgo } from "@/lib/format";
import { TcapAlertForm } from "./tcap-alert-form";
import { DeleteAlertButton } from "./delete-alert-button";
import type { TcapSeverity } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const SEVERITY_STYLES: Record<TcapSeverity, string> = {
    low: "bg-base-700 text-slate-300",
    moderate: "bg-accent/10 text-accent",
    high: "bg-warn/10 text-warn border border-warn/30",
    critical: "bg-danger/10 text-danger border border-danger/30",
};

export default async function TcapPage() {
    const supabase = createClient();
    const [{ data: cases }, { data: entities }, { data: alerts }] = await Promise.all([
          supabase.from("cases").select("*").order("title"),
          supabase.from("entities").select("*").order("name"),
          supabase
            .from("tcap_alerts")
            .select("*, cases(title)")
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

  return (
        <div>
          <PageHeader
          kicker="Counter-terrorism content monitoring"
          title="Tech Against Terrorism (TCAP)"
          description="Track content referred to the Terrorist Content Analytics Platform and log alerts back from TCAP's portal and partner notifications."
        />

      <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="card space-y-2 text-sm text-slate-400">
              <p className="text-sm font-medium text-slate-200">About TCAP</p>
              <p>
                Tech Against Terrorism runs the Terrorist Content Analytics Platform (TCAP), which
                flags verified terrorist and violent extremist content to member platforms. This
                case-management app does not call the TCAP API directly; use this section to keep an
                analyst-maintained log of alerts received or referrals made through the TCAP portal.
                              </p>
              <p>
                <a
                  className="text-accent underline"
                  href="https://www.terrorismanalytics.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  terrorismanalytics.org
                </a> ·{" "}
                <a
                  className="text-accent underline"
                  href="https://www.techagainstterrorism.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  techagainstterrorism.org
                </a>
              </p>
            </div>

          <TcapAlertForm cases={cases ?? []} entities={entities ?? []} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-slate-300">Alert log</h2>
{alerts?.length ? (
              <div className="card divide-y divide-base-700 p-0">
  {alerts.map((a: any) => (
                    <div key={a.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                       <p className="text-sm font-medium text-slate-100">{a.title}</p>
                       <span className={`badge uppercase tracking-wide ${SEVERITY_STYLES[a.severity as TcapSeverity]}`}>
 {a.severity}
                     </span>
                   </div>
                   <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-slate-500">
                     <span>{a.alert_type}</span>
                     <span>·</span>
                     <span>{timeAgo(a.created_at)}</span>
 {a.cases?.title && (
                         <>
                           <span>·</span>
                          <span>{a.cases.title}</span>
                        </>
                      )}
                   </div>
 {a.summary && <p className="mt-1.5 text-sm text-slate-400">{a.summary}</p>}
                   <div className="mt-1.5 flex items-center justify-between">
 {a.source_url ? (
                         <a
                           className="text-xs text-accent underline"
                           href={a.source_url}
                           target="_blank"
                           rel="noreferrer"
                         >
                           Source
                        </a>
                      ) : (
                                              <span />
                                            )}
                     <DeleteAlertButton id={a.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
                        <EmptyState
                          icon={<AlertIcon className="h-8 w-8" />}
              title="No TCAP alerts logged yet"
              description="Log an alert once TCAP flags content tied to one of your cases or entities."
            />
          )}
        </div>
      </div>
    </div>
  );
}
