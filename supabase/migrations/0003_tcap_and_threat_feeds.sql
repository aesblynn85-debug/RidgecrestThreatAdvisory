-- Ridgecrest Intelligence -- TCAP alert log + OpenCTI/MISP indicator log
-- Two new analyst-maintained logs, following the same pattern as
-- osint_results / timeline_notes: recorded manually here because neither
-- source is something this app can safely auto-pull without credentials it
-- doesn't have (TCAP access is vetted membership; OpenCTI/MISP are separate
-- self-hosted platforms with their own auth). See README "Known limitations".

create table if not exists tcap_alerts (
    id uuid primary key default gen_random_uuid(),
    case_id uuid references cases(id) on delete set null,
    entity_id uuid references entities(id) on delete set null,
    title text not null,
    alert_type text not null default 'content_alert' check (
      alert_type in ('content_alert', 'account_alert', 'url_alert', 'other')
    ),
    severity text not null default 'moderate' check (
      severity in ('low', 'moderate', 'high', 'critical')
    ),
    summary text,
    source_url text,
    received_at timestamptz not null default now(),
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now()
  );

create index if not exists tcap_alerts_case_idx on tcap_alerts(case_id);
create index if not exists tcap_alerts_received_idx on tcap_alerts(received_at desc);

create table if not exists threat_feed_indicators (
    id uuid primary key default gen_random_uuid(),
    case_id uuid references cases(id) on delete set null,
    entity_id uuid references entities(id) on delete set null,
    source text not null default 'misp' check (source in ('opencti', 'misp', 'other')),
    indicator_type text not null default 'other' check (
      indicator_type in ('ip', 'domain', 'url', 'hash', 'email', 'other')
    ),
    value text not null,
    description text,
    tags text[] not null default '{}',
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now()
  );

create index if not exists threat_feed_indicators_case_idx on threat_feed_indicators(case_id);
create index if not exists threat_feed_indicators_created_idx on threat_feed_indicators(created_at desc);

alter table tcap_alerts enable row level security;
alter table threat_feed_indicators enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['tcap_alerts', 'threat_feed_indicators']
  loop
    execute format('drop policy if exists %I on %I;', t || '_owner_all', t);
    execute format(
            'create policy %I on %I for all to authenticated using (true) with check (true);',
            t || '_owner_all', t
          );
  end loop;
end $$;
