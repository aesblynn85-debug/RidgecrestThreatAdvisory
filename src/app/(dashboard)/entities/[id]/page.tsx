import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EntityTypeBadge, ConfidenceBadge } from "@/components/badges";
import { formatDate, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EntityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const entityId = params.id;

  const [{ data: entity }, { data: caseLinks }, { data: outgoing }, { data: incoming }, { data: osint }] =
    await Promise.all([
      supabase.from("entities").select("*").eq("id", entityId).single(),
      supabase
        .from("case_entities")
        .select("case_id, cases(*)")
        .eq("entity_id", entityId),
      supabase
        .from("entity_links")
        .select("*, to:entities!entity_links_to_entity_id_fkey(*)")
        .eq("from_entity_id", entityId),
      supabase
        .from("entity_links")
        .select("*, from:entities!entity_links_from_entity_id_fkey(*)")
        .eq("to_entity_id", entityId),
      supabase
        .from("osint_results")
        .select("*")
        .eq("entity_id", entityId)
        .order("retrieved_at", { ascending: false }),
    ]);

  if (!entity) notFound();

  const cases = (caseLinks ?? []).map((c: any) => c.cases).filter(Boolean);
  const relationships = [
    ...(outgoing ?? []).map((l: any) => ({ ...l, other: l.to, direction: "→" })),
    ...(incoming ?? []).map((l: any) => ({ ...l, other: l.from, direction: "←" })),
  ];

  return (
    <div>
      <Link href="/entities" className="text-xs text-slate-500 hover:text-accent">
        ← All entities
      </Link>

      <div className="mb-8 mt-1 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <EntityTypeBadge type={entity.entity_type} />
            <span className="text-xs text-slate-500">
              added {formatDate(entity.created_at)}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-white">{entity.name}</h1>
          {entity.notes && (
            <p className="mt-1 max-w-2xl text-sm text-slate-400">{entity.notes}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <h2 className="mb-2 text-sm font-medium text-slate-300">Relationships</h2>
            {relationships.length ? (
              <div className="card divide-y divide-base-700 p-0">
                {relationships.map((r) => (
                  <Link
                    key={r.id}
                    href={`/entities/${r.other.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-base-800/50"
                  >
                    <div>
                      <p className="text-sm text-slate-100">
                        {r.direction} {r.other?.name}{" "}
                        <span className="text-slate-500">— {r.relationship_type}</span>
                      </p>
                      {r.notes && (
                        <p className="mt-0.5 text-xs text-slate-500">{r.notes}</p>
                      )}
                    </div>
                    <ConfidenceBadge level={r.confidence} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="card text-sm text-slate-500">
                No recorded relationships yet. Add one from Link Analysis.
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-medium text-slate-300">
              OSINT results mentioning this entity
            </h2>
            {osint?.length ? (
              <div className="card divide-y divide-base-700 p-0">
                {osint.map((r) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{timeAgo(r.retrieved_at)}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-100">{r.query}</p>
                    {r.answer && (
                      <p className="mt-1 text-sm text-slate-400">{r.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="card text-sm text-slate-500">
                No OSINT results tagged to this entity yet.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-sm font-medium text-slate-300">Attributes</h2>
            <div className="card space-y-2">
              {Object.keys(entity.attributes || {}).length ? (
                Object.entries(entity.attributes).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-right text-slate-200">{String(v)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No attributes recorded.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-medium text-slate-300">Linked cases</h2>
            {cases.length ? (
              <div className="space-y-2">
                {cases.map((c: any) => (
                  <Link key={c.id} href={`/cases/${c.id}`} className="card block py-2.5 hover:border-accent/40">
                    <p className="truncate text-sm text-slate-100">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.status}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="card text-sm text-slate-500">Not linked to any case.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
