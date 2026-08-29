import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/page-header";
import { EntitiesIcon } from "@/components/icons";
import { EntityTypeBadge } from "@/components/badges";
import { NewEntityForm } from "./new-entity-form";

export const dynamic = "force-dynamic";

export default async function EntitiesPage() {
  const supabase = createClient();
  const { data: entities } = await supabase
    .from("entities")
    .select("*")
    .order("created_at", { ascending: false });

  const hasEntities = entities && entities.length > 0;

  return (
    <div>
      <PageHeader
        kicker="Entity resolution"
        title="Entities"
        description="Track people, organizations, identifiers, locations, vehicles, domains, and infrastructure."
        action={hasEntities ? <NewEntityForm /> : undefined}
      />

      {!hasEntities ? (
        <EmptyState
          icon={<EntitiesIcon className="h-10 w-10" />}
          title="No entities tracked"
          description="Add the first subject, organization, identifier, or location for correlation."
          action={<div className="mt-2"><NewEntityForm /></div>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entities.map((e) => (
            <Link
              key={e.id}
              href={`/entities/${e.id}`}
              className="card hover:border-accent/40"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-white">{e.name}</p>
                <EntityTypeBadge type={e.entity_type} />
              </div>
              {e.notes && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                  {e.notes}
                </p>
              )}
              {Object.keys(e.attributes || {}).length > 0 && (
                <div className="mt-3 space-y-0.5 border-t border-base-700 pt-2">
                  {Object.entries(e.attributes)
                    .slice(0, 3)
                    .map(([k, v]) => (
                      <p key={k} className="truncate text-xs text-slate-500">
                        <span className="text-slate-400">{k}:</span> {String(v)}
                      </p>
                    ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
