-- Ridgecrest Intelligence — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- Single-owner model: any authenticated user may read/write everything, because
-- Supabase Auth on this project is expected to hold exactly one account (the owner).
-- If you later add analysts, tighten the policies below (see comments).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Cases
-- ---------------------------------------------------------------------------
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  case_number text unique,
  title text not null,
  client_name text,
  status text not null default 'open' check (status in ('open', 'active', 'pending_review', 'closed')),
  summary text,
  opened_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create index if not exists cases_status_idx on cases(status);

-- ---------------------------------------------------------------------------
-- Entities (people, orgs, vehicles, domains, locations, identifiers, infra)
-- ---------------------------------------------------------------------------
create table if not exists entities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (
    entity_type in ('person', 'organization', 'vehicle', 'domain', 'location', 'identifier', 'infrastructure', 'other')
  ),
  name text not null,
  attributes jsonb not null default '{}'::jsonb,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entities_type_idx on entities(entity_type);
create index if not exists entities_name_idx on entities using gin (to_tsvector('english', name));

-- Many-to-many: an entity can surface in more than one case
create table if not exists case_entities (
  case_id uuid not null references cases(id) on delete cascade,
  entity_id uuid not null references entities(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (case_id, entity_id)
);

-- ---------------------------------------------------------------------------
-- CAD records (mirrored from the dispatch system via CSV import or webhook)
-- ---------------------------------------------------------------------------
create table if not exists cad_records (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  record_type text not null default 'incident',
  occurred_at timestamptz not null default now(),
  narrative text,
  location text,
  raw_data jsonb not null default '{}'::jsonb,
  source text not null default 'csv_import' check (source in ('csv_import', 'webhook', 'manual')),
  case_id uuid references cases(id) on delete set null,
  imported_by uuid references auth.users(id),
  imported_at timestamptz not null default now()
);

create index if not exists cad_records_case_idx on cad_records(case_id);
create index if not exists cad_records_occurred_idx on cad_records(occurred_at desc);
-- Plain (non-partial) unique index: Postgres unique indexes already treat NULL
-- as distinct from every other value by default, so this still allows any
-- number of records with no external_id. It's deliberately NOT partial
-- (`where external_id is not null`) because a partial index can't be used as
-- an `ON CONFLICT (external_id)` upsert target unless every upsert statement
-- repeats its predicate — keeping it a full index lets both the CSV import
-- and the webhook route upsert with a plain `onConflict: "external_id"`.
create unique index if not exists cad_records_external_id_idx on cad_records(external_id);

-- ---------------------------------------------------------------------------
-- Live OSINT search results (Perplexity Sonar), kept with provenance
-- ---------------------------------------------------------------------------
create table if not exists osint_results (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) on delete cascade,
  entity_id uuid references entities(id) on delete set null,
  query text not null,
  answer text,
  citations jsonb not null default '[]'::jsonb,
  model text default 'sonar',
  created_by uuid references auth.users(id),
  retrieved_at timestamptz not null default now()
);

create index if not exists osint_results_case_idx on osint_results(case_id);

-- ---------------------------------------------------------------------------
-- Link analysis: analyst-recorded relationships between entities
-- ---------------------------------------------------------------------------
create table if not exists entity_links (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  from_entity_id uuid not null references entities(id) on delete cascade,
  to_entity_id uuid not null references entities(id) on delete cascade,
  relationship_type text not null,
  confidence text not null default 'moderate' check (confidence in ('low', 'moderate', 'high', 'confirmed')),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint entity_links_distinct check (from_entity_id <> to_entity_id)
);

create index if not exists entity_links_case_idx on entity_links(case_id);

-- ---------------------------------------------------------------------------
-- Manual timeline notes (CAD + OSINT events are unioned in at query time)
-- ---------------------------------------------------------------------------
create table if not exists timeline_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  title text not null,
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists timeline_notes_case_idx on timeline_notes(case_id);

-- Note: case_timeline (unioning cad_records + osint_results + timeline_notes
-- + assessments) is created further down, *after* the assessments table
-- exists — a view can't reference a table that doesn't exist yet.

-- ---------------------------------------------------------------------------
-- Assessments (finished intelligence, ready to brief a client)
-- ---------------------------------------------------------------------------
create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) on delete cascade,
  title text not null,
  threat_level text not null default 'guarded' check (
    threat_level in ('low', 'guarded', 'elevated', 'high', 'severe')
  ),
  confidence_level text not null default 'moderate' check (
    confidence_level in ('low', 'moderate', 'high')
  ),
  summary text,
  indicators jsonb not null default '[]'::jsonb,
  gaps text,
  recommendations text,
  status text not null default 'draft' check (status in ('draft', 'final')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finalized_at timestamptz
);

create index if not exists assessments_case_idx on assessments(case_id);

-- Unified, read-only timeline view: CAD + OSINT + manual notes + assessments.
-- Defined here, now that every table it selects from exists.
create or replace view case_timeline as
  select
    id, case_id, occurred_at, 'cad'::text as event_type,
    coalesce(record_type, 'CAD record') as title, narrative as description,
    source as meta
  from cad_records
  where case_id is not null
  union all
  select
    id, case_id, retrieved_at, 'osint'::text as event_type,
    query as title, answer as description, model as meta
  from osint_results
  where case_id is not null
  union all
  select
    id, case_id, occurred_at, 'manual'::text as event_type,
    title, description, null as meta
  from timeline_notes
  union all
  select
    id, case_id, created_at, 'assessment'::text as event_type,
    title, summary as description, status as meta
  from assessments
  where case_id is not null;

-- ---------------------------------------------------------------------------
-- Org-wide settings (single row) + a light audit trail for Security & Sync
-- ---------------------------------------------------------------------------
create table if not exists org_settings (
  id boolean primary key default true check (id),
  session_timeout_hours int not null default 8,
  sign_in_throttle_seconds int not null default 30,
  cad_sync_enabled boolean not null default true,
  last_cad_sync_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into org_settings (id) values (true) on conflict (id) do nothing;

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor uuid references auth.users(id),
  action text not null,
  target text,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx on audit_log(created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists cases_set_updated_at on cases;
create trigger cases_set_updated_at before update on cases
  for each row execute function set_updated_at();

drop trigger if exists entities_set_updated_at on entities;
create trigger entities_set_updated_at before update on entities
  for each row execute function set_updated_at();

drop trigger if exists assessments_set_updated_at on assessments;
create trigger assessments_set_updated_at before update on assessments
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — single-owner model: any authenticated user gets full
-- access. Service-role (used by the CAD webhook route) bypasses RLS entirely.
-- If you add teammates later, replace `to authenticated using (true)` below
-- with role-aware checks (e.g. a `memberships` table).
-- ---------------------------------------------------------------------------
alter table cases enable row level security;
alter table entities enable row level security;
alter table case_entities enable row level security;
alter table cad_records enable row level security;
alter table osint_results enable row level security;
alter table entity_links enable row level security;
alter table timeline_notes enable row level security;
alter table assessments enable row level security;
alter table org_settings enable row level security;
alter table audit_log enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'cases', 'entities', 'case_entities', 'cad_records', 'osint_results',
    'entity_links', 'timeline_notes', 'assessments', 'org_settings', 'audit_log'
  ]
  loop
    execute format(
      'drop policy if exists %I on %I;', t || '_owner_all', t
    );
    execute format(
      'create policy %I on %I for all to authenticated using (true) with check (true);',
      t || '_owner_all', t
    );
  end loop;
end $$;
