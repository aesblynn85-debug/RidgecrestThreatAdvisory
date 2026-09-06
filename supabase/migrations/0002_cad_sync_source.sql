-- Ridgecrest Intelligence -- CAD sync backend
-- Allows cad_records.source to be 'cad_sync', for records pulled directly
-- from the RidgecrestCAD Supabase project (calls/dispatches, reports, and
-- guard_notes) via src/lib/cad-source.ts + the syncCadFromSource action,
-- in addition to the existing 'csv_import', 'webhook', and 'manual' sources.

alter table cad_records drop constraint if exists cad_records_source_check;
alter table cad_records add constraint cad_records_source_check
  check (source in ('csv_import', 'webhook', 'manual', 'cad_sync'));
