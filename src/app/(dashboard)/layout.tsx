import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

const orgName = process.env.NEXT_PUBLIC_ORG_NAME || "R.A.V.E.N. Intelligence";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-base-950">
      <Sidebar orgName={orgName} userEmail={user.email ?? "owner"} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 pt-20 sm:px-6 md:px-8 md:py-10 md:pt-10">{children}</div>
      </main>
    </div>
  );
}
