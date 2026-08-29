import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { formatDateTime } from "@/lib/format";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

const CHECKLIST = [
  "HTTPS enforced end-to-end (Vercel-managed TLS)",
  "Passwords hashed by Supabase Auth (bcrypt); never stored or logged in plaintext",
  "Bearer sessions via HTTP-only cookies; no client-readable auth tokens",
  "Row Level Security enforced on every table — no anon access",
  "CAD webhook requires a shared secret header; service-role key stays server-only",
  "Server-side gate (middleware) checks the session on every route",
];

export default async function SecurityPage() {
  const supabase = createClient();
  const [{ data: settings }, { data: user }] = await Promise.all([
    supabase.from("org_settings").select("*").single(),
    supabase.auth.getUser().then((r) => ({ data: r.data.user })),
  ]);

  return (
    <div>
      <PageHeader
        kicker="Owner control"
        title="Security & synchronization"
        description="Review the portal boundary and run a manual CAD synchronization."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card">
            <p className="text-sm font-medium text-slate-200">Owner account</p>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Owner email" value={user?.email || "—"} />
              <Row label="Access model" value="Single owner account" />
              <Row label="Owner since" value={formatDateTime(user?.created_at)} />
              <Row label="Last sign-in" value={formatDateTime(user?.last_sign_in_at)} />
            </dl>
          </div>

          <div className="card">
            <p className="text-sm font-medium text-slate-200">
              Transport & application security
            </p>
            <ul className="mt-3 space-y-2">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {settings && <SettingsForm settings={settings} />}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-ok">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10.5l2.5 2.5L14 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
