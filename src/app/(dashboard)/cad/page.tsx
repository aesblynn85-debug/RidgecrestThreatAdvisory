import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { timeAgo } from "@/lib/format";
import { CadImportForm } from "./cad-import-form";
import { CadTable } from "./cad-table";

export const dynamic = "force-dynamic";

export default async function CadIntelligencePage() {
  const supabase = createClient();
  const [{ data: records }, { data: cases }, { data: settings }] = await Promise.all([
    supabase
      .from("cad_records")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(1000),
    supabase.from("cases").select("*").order("title"),
    supabase.from("org_settings").select("*").single(),
  ]);

  return (
    <div>
      <PageHeader
        kicker="Full CAD mirror"
        title="CAD intelligence feed"
        description="Search every synchronized operational record. Credential material is excluded from the mirror."
        action={
          <div className="flex items-center gap-3">
            {settings?.last_cad_sync_at && (
              <span className="text-xs text-slate-500">
                Last sync {timeAgo(settings.last_cad_sync_at)}
              </span>
            )}
            <CadImportForm cases={cases ?? []} />
          </div>
        }
      />

      <CadTable records={records ?? []} />
    </div>
  );
}
