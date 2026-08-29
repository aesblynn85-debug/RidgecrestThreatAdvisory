import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge, ThreatBadge } from "@/components/badges";
import { CasesIcon, EntitiesIcon, OsintIcon, AssessmentsIcon } from "@/components/icons";
import { formatDate, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const supabase = createClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: openCases },
    { count: totalEntities },
    { count: recentOsint },
    { count: draftAssessments },
    { data: activeCases },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("cases").select("*", { count: "exact", head: true }).in("status", ["open", "active"]),
    supabase.from("entities").select("*", { count: "exact", head: true }),
    supabase.from("osint_results").select("*", { count: "exact", head: true }).gte("retrieved_at", sevenDaysAgo),
    supabase.from("assessments").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase
      .from("cases")
      .select("*")
      .in("status", ["open", "active"])
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const { data: recentAssessments } = await supabase
    .from("assessments")
    .select("*, cases(title)")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div>
      <PageHeader kicker="Ridgecrest threat advisory" title="Overview" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open cases" value={openCases ?? 0} icon={<CasesIcon className="h-5 w-5" />} hint="Open + active" />
        <StatCard label="Entities tracked" value={totalEntities ?? 0} icon={<EntitiesIcon className="h-5 w-5" />} />
        <StatCard label="OSINT searches" value={recentOsint ?? 0} icon={<OsintIcon className="h-5 w-5" />} hint="Last 7 days" />
        <StatCard label="Draft assessments" value={draftAssessments ?? 0} icon={<AssessmentsIcon className="h-5 w-5" />} hint="Awaiting finalization" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-300">Active cases</h2>
            <Link href="/cases" className="text-xs text-accent hover:underline">
              View all →
            </Link>
          </div>
          {activeCases?.length ? (
            <div className="space-y-2">
              {activeCases.map((c) => (
                <Link key={c.id} href={`/cases/${c.id}`} className="card flex items-center justify-between hover:border-accent/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">{c.title}</p>
                    <p className="text-xs text-slate-500">
                      {c.client_name || "No client"} · opened {formatDate(c.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="card text-sm text-slate-500">No open cases right now.</p>
          )}

          <div className="mb-2 mt-8 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-300">Recent assessments</h2>
            <Link href="/assessments" className="text-xs text-accent hover:underline">
              View all →
            </Link>
          </div>
          {recentAssessments?.length ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {recentAssessments.map((a: any) => (
                <Link key={a.id} href={`/assessments/${a.id}`} className="card hover:border-accent/40">
                  <div className="flex items-center justify-between">
                    <ThreatBadge level={a.threat_level} />
                    <span className="text-xs text-slate-500">{a.status}</span>
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-slate-100">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.cases?.title || "No case"}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="card text-sm text-slate-500">No assessments yet.</p>
          )}
        </div>

        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-300">Recent activity</h2>
          {recentActivity?.length ? (
            <div className="card space-y-3 py-4">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div className="min-w-0">
                    <p className="truncate text-xs text-slate-300">{a.action}</p>
                    <p className="text-[11px] text-slate-500">{timeAgo(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="card text-sm text-slate-500">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
