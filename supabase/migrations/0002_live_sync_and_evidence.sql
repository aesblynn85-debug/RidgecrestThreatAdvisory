-- Ridgecrest Intelligence -- migration 0002
-- Run this once in the Supabase SQL editor after 0001_init.sql.
-- Adds a 'live_sync' source for cad_records (pulled directly from the CAD's
-- own Supabase project rather than CSV/webhook), and an evidence table +
-- private Storage bucket for attaching files to cases.

-- Allow 'live_sync' as a cad_records.source value
alter table cad_records drop constraint if exists cad_records_source_check;
alter table cad_records add constraint cad_records_source_check
  check (source in ('csv_import', 'webhook', 'manual', 'live_sync'));

-- ---------------------------------------------------------------------------
-- Evidence (files attached to a case)
-- ---------------------------------------------------------------------------
create table if not exists evidence (
    id uuid primary key default gen_random_uuid(),
    case_id uuid not null references cases(id) on delete cascade,
    entity_id uuid references entities(id) on delete set null,
    file_path text not null,
    file_name text not null,
    file_type text,
    size_bytes bigint,
    description text,
    uploaded_by uuid references auth.users(id),
    uploaded_at timestamptz not null default now()
  );

create index if not exists evidence_case_idx on evidence(case_id);

alter table evidence enable row level security;
drop policy if exists evidence_owner_all on evidence;
create policy evidence_owner_all on evidence for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Private Storage bucket for evidence files (25MB/file cap)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('case-evidence', 'case-evidence', false, 26214400)
on conflict (id) do update set file_size_limit = 26214400, public = false;

drop policy if exists case_evidence_owner_all on storage.objects;
create policy case_evidence_owner_all on storage.objects for all
  to authenticated
  using (bucket_id = 'case-evidence')
  with check (bucket_id = 'case-evidence');

-- ---------------------------------------------------------------------------
-- Fold evidence into the unified case_timeline view
-- ---------------------------------------------------------------------------
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
where case_id is not null
union all
select
  id, case_id, uploaded_at, 'evidence'::text as event_type,
  file_name as title, description, file_type as meta
from evidence
where case_id is not null;
