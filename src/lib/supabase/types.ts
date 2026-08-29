// Hand-written types matching supabase/migrations/0001_init.sql.
// Keep in sync with the schema; regenerate with `supabase gen types typescript`
// once you have the Supabase CLI available, if you'd rather not hand-maintain this.

export type CaseStatus = "open" | "active" | "pending_review" | "closed";

export type EntityType =
  | "person"
  | "organization"
  | "vehicle"
  | "domain"
  | "location"
  | "identifier"
  | "infrastructure"
  | "other";

export type Confidence = "low" | "moderate" | "high" | "confirmed";
export type AssessmentConfidence = "low" | "moderate" | "high";
export type ThreatLevel = "low" | "guarded" | "elevated" | "high" | "severe";
export type AssessmentStatus = "draft" | "final";
export type CadSource = "csv_import" | "webhook" | "manual";
export type TimelineEventType = "cad" | "osint" | "manual" | "assessment";

export interface CaseRow {
  id: string;
  case_number: string | null;
  title: string;
  client_name: string | null;
  status: CaseStatus;
  summary: string | null;
  opened_by: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface EntityRow {
  id: string;
  entity_type: EntityType;
  name: string;
  attributes: Record<string, unknown>;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseEntityRow {
  case_id: string;
  entity_id: string;
  added_at: string;
}

export interface CadRecordRow {
  id: string;
  external_id: string | null;
  record_type: string;
  occurred_at: string;
  narrative: string | null;
  location: string | null;
  raw_data: Record<string, unknown>;
  source: CadSource;
  case_id: string | null;
  imported_by: string | null;
  imported_at: string;
}

export interface OsintCitation {
  url: string;
  title?: string;
  snippet?: string;
}

export interface OsintResultRow {
  id: string;
  case_id: string | null;
  entity_id: string | null;
  query: string;
  answer: string | null;
  citations: OsintCitation[];
  model: string | null;
  created_by: string | null;
  retrieved_at: string;
}

export interface EntityLinkRow {
  id: string;
  case_id: string;
  from_entity_id: string;
  to_entity_id: string;
  relationship_type: string;
  confidence: Confidence;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface TimelineNoteRow {
  id: string;
  case_id: string;
  occurred_at: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CaseTimelineRow {
  id: string;
  case_id: string;
  occurred_at: string;
  event_type: TimelineEventType;
  title: string;
  description: string | null;
  meta: string | null;
}

export interface AssessmentRow {
  id: string;
  case_id: string | null;
  title: string;
  threat_level: ThreatLevel;
  confidence_level: AssessmentConfidence;
  summary: string | null;
  indicators: string[];
  gaps: string | null;
  recommendations: string | null;
  status: AssessmentStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  finalized_at: string | null;
}

export interface OrgSettingsRow {
  id: true;
  session_timeout_hours: number;
  sign_in_throttle_seconds: number;
  cad_sync_enabled: boolean;
  last_cad_sync_at: string | null;
  updated_at: string;
}

export interface AuditLogRow {
  id: string;
  actor: string | null;
  action: string;
  target: string | null;
  created_at: string;
}

// Minimal `Database` shape so `createClient<Database>()` gives us typed
// `.from("table")` calls without pulling in the full generated-types tooling.
export interface Database {
  public: {
    Tables: {
      cases: { Row: CaseRow; Insert: Partial<CaseRow>; Update: Partial<CaseRow> };
      entities: { Row: EntityRow; Insert: Partial<EntityRow>; Update: Partial<EntityRow> };
      case_entities: { Row: CaseEntityRow; Insert: Partial<CaseEntityRow>; Update: Partial<CaseEntityRow> };
      cad_records: { Row: CadRecordRow; Insert: Partial<CadRecordRow>; Update: Partial<CadRecordRow> };
      osint_results: { Row: OsintResultRow; Insert: Partial<OsintResultRow>; Update: Partial<OsintResultRow> };
      entity_links: { Row: EntityLinkRow; Insert: Partial<EntityLinkRow>; Update: Partial<EntityLinkRow> };
      timeline_notes: { Row: TimelineNoteRow; Insert: Partial<TimelineNoteRow>; Update: Partial<TimelineNoteRow> };
      assessments: { Row: AssessmentRow; Insert: Partial<AssessmentRow>; Update: Partial<AssessmentRow> };
      org_settings: { Row: OrgSettingsRow; Insert: Partial<OrgSettingsRow>; Update: Partial<OrgSettingsRow> };
      audit_log: { Row: AuditLogRow; Insert: Partial<AuditLogRow>; Update: Partial<AuditLogRow> };
    };
    Views: {
      case_timeline: { Row: CaseTimelineRow };
    };
  };
}
