import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { CrimeMapView } from "./crime-map-view";

export const dynamic = "force-dynamic";

export default async function CrimeMapPage() {
  const supabase = createClient();

  const { data: incidents } = await supabase
    .from("cad_records")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(30);

  return (
    <div>
      <PageHeader
        kicker="Geospatial awareness"
        title="Crime Map"
        description="Search any address to center the live traffic map on it, and cross-reference recent CAD incident locations around client sites."
      />
      <CrimeMapView incidents={incidents ?? []} />
    </div>
  );
}
