# R.A.V.E.N. Intelligence — OSINT Case Platform

**R.A.V.E.N.** — Respond, Assess, Verify, Engage, Negate.

A self-hosted, single-owner OSINT case management app: open a case, pull CAD
records and live open-source leads into it, track entities and their
relationships, build a unified timeline, and write a client-ready threat
assessment. Built as a plain Next.js + Supabase app you own end-to-end —
no third-party sandbox in the loop.

Sections: **Overview · CAD Intelligence · Cases · Entities · Live OSINT · Link Analysis · Timeline · Assessments · TCAP Alerts · OpenCTI/MISP Feeds · Security & Sync.**

## Stack

- **Next.js 14** (App Router, Server Actions, TypeScript, Tailwind CSS)
- **Supabase** — Postgres, Auth (single owner, email/password), Row Level Security
- **SearXNG** (self-hosted) — Live OSINT search engine via its JSON API
- **RidgecrestCAD sync** — reads calls/dispatches, field reports, and guard notes
directly from the RidgecrestCAD Supabase project and mirrors them into `cad_records`
- **Vercel** — hosting

No other runtime dependencies. Icons, the link-analysis graph, and CSV
parsing are hand-rolled so there's nothing extra to audit or version-pin.

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run, in order, the contents of [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql), [`supabase/migrations/0002_cad_sync_source.sql`](./supabase/migrations/0002_cad_sync_source.sql), and [`supabase/migrations/0003_tcap_and_threat_feeds.sql`](./supabase/migrations/0003_tcap_and_threat_feeds.sql) once each. Together they create every table (including `tcap_alerts` and `threat_feed_indicators`), the `case_timeline` view, RLS policies, a starter `org_settings` row, and allow `cad_sync` as a CAD record source.
3. Go to **Authentication → Users → Add user** and create your own owner
account (email + password). There is no public sign-up screen —
this app assumes exactly one account.
4. Grab your keys from **Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never
exposed to the browser — used solely by the CAD webhook route)

## 2. Set up SearXNG

Live OSINT search calls a self-hosted SearXNG instance's JSON API server-side.

1. Stand up a SearXNG instance (`docker run` or `docker compose` from [github.com/searxng/searxng](https://github.com/searxng/searxng) is the fastest path) and enable JSON output by adding `- json` under `search: formats:` in its `settings.yml`. Most public instances disable JSON output to deter scraping, so this generally means an instance you run yourself.
2. Set it as `SEARXNG_URL` (e.g. `http://localhost:8080`) in your environment — locally in `.env.local`, and in Vercel under Project → Settings → Environment Variables for production. Until this is set, every other page works normally — only the Live OSINT search will show a clear configuration error.

## 3. Configure environment variables

Copy `.env.local.example` to `.env.local` for local dev, and add the same
keys in Vercel (**Project → Settings → Environment Variables**) for
production:

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | everywhere |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | everywhere |
| `SUPABASE_SERVICE_ROLE_KEY` | `/api/cad/webhook` only (server-only) |
| `SEARXNG_URL` | Live OSINT search engine (server-only) |
| `CAD_WEBHOOK_SECRET` | `/api/cad/webhook` auth (server-only) |
| `CAD_SUPABASE_URL` | CAD sync — RidgecrestCAD's own Supabase project URL (server-only) |
| `CAD_SUPABASE_ANON_KEY` | CAD sync — RidgecrestCAD's own Supabase anon key (server-only) |
| `NEXT_PUBLIC_ORG_NAME` | display name in the sidebar/login/briefs |

## 4. Run it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, sign in with the owner account you created in
Supabase, and you're in.

## 5. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel, **Add New → Project**, import the repo.
3. Add the environment variables from step 3.
4. Deploy. Every push to your default branch redeploys automatically.

## Feeding it real data

### CAD records — three ways in

- **Live sync from RidgecrestCAD**: CAD Intelligence → *Sync from CAD*. Reads
calls/dispatches, field reports, and guard notes straight from the
RidgecrestCAD Supabase project (via `CAD_SUPABASE_URL`/`CAD_SUPABASE_ANON_KEY`)
and upserts them into `cad_records`. Safe to click repeatedly — each source
row maps to a stable `external_id`, so re-syncing updates rather than
duplicates.
- **CSV import**: CAD Intelligence → *Import CSV*. Recognized columns:
`external_id, record_type, occurred_at, narrative, location` (aliases
`id`/`type`/`date`/`time`/`description`/`address` also work). Anything
else in the file is preserved under "raw detail."
- **Webhook push**, for a real dispatch system to call directly:

```bash
curl -X POST https://your-app.vercel.app/api/cad/webhook \
-H "content-type: application/json" \
-H "x-webhook-secret: $CAD_WEBHOOK_SECRET" \
-d '{
"records": [
{
"external_id": "CAD-88421",
"record_type": "trespass",
"occurred_at": "2026-08-28T22:14:00Z",
"narrative": "Subject asked to leave lobby, refused twice.",
"location": "Ridgecrest Plaza, Lobby A"
}
]
}'
```

All three paths `upsert` on `external_id`, so re-sending/re-syncing the same
record updates it instead of duplicating it.

### Live OSINT

Search a lead on the OSINT tab (server-side call to a self-hosted SearXNG instance's JSON API), review the answer and its sources, then optionally attach it to a case and/or an entity so it shows up in that case's timeline and that entity's profile.

### Entities, links, timeline, assessments

- Add entities from the **Entities** tab or inline while linking one to a
case.
- **Link Analysis** relationships are scoped to a case — pick a case, link
at least two entities to it, then record how they relate. The graph view
appears automatically once there's something to draw.
- **Timeline** fuses CAD records + saved OSINT results + manual notes +
assessment milestones into one chronology per case (via the `case_timeline`
SQL view — nothing is duplicated, it's computed at query time).
- **Assessments** capture a threat level, confidence, indicators, gaps, and
recommendations. Each has a *Client brief* tab — a clean, printable layout
(`window.print()` → Save as PDF) separate from the editing view.

## Security model

Single-owner by design: any authenticated Supabase user has full read/write
access (RLS policies are `for all to authenticated using (true)`), because
this project expects exactly one Supabase Auth user. The **Security & Sync**
page documents the active protections and lets you tune session expiration
and sign-in throttling.

If you later add teammates, don't just create more Supabase users under the
current policies — everyone would see everything. Add a `memberships` table
and tighten the RLS policies in `0001_init.sql` to check role/ownership
before opening this up to more than one person.

## Known limitations / next steps

- This project was authored in an environment without npm registry access,
so the dependency tree could not be `npm install`ed or build-verified here.
Run `npm install && npm run build` after pulling it down — if anything
doesn't compile, it's most likely a version-pin mismatch in `package.json`
worth bumping, not a structural issue.
- `src/lib/supabase/types.ts` is hand-written to match the SQL schema. If you
add columns/tables, update it too, or swap it for
`supabase gen types typescript` output once you have the Supabase CLI.
- The Link Analysis graph uses a simple deterministic circular layout (no
charting dependency). Fine for a few dozen nodes; swap in a real
force-directed layout if a case graph gets large.
- No file/evidence upload yet (e.g. screenshots as case evidence) — add a
Supabase Storage bucket + an `evidence` table following the same pattern
as `cad_records`/`osint_results` if you need that.
- Live OSINT search relies solely on a self-hosted SearXNG instance (`SEARXNG_URL`) — there's no fallback engine, so if SearXNG is unset or unreachable, the search will return a clear error until it's configured.
- TCAP Alerts and OpenCTI/MISP Feeds are analyst-maintained logs, not live pulls — this app has no TCAP API integration (membership is vetted) and no OpenCTI GraphQL/MISP REST client yet. Log what you receive from those platforms manually for now; wiring up real feed ingestion is a natural next step once you've stood up your own OpenCTI/MISP instance and have credentials to test against.
- Run `supabase/migrations/0003_tcap_and_threat_feeds.sql` (after 0001 and 0002) to create the `tcap_alerts` and `threat_feed_indicators` tables backing those two new sections.
