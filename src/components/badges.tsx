import type {
  AssessmentConfidence,
  CaseStatus,
  Confidence,
  ThreatLevel,
} from "@/lib/supabase/types";

const THREAT_STYLES: Record<ThreatLevel, string> = {
  low: "bg-ok/10 text-ok border border-ok/30",
  guarded: "bg-warn/10 text-warn border border-warn/30",
  elevated: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
  high: "bg-danger/10 text-danger border border-danger/30",
  severe: "bg-danger/20 text-danger border border-danger/50",
};

export function ThreatBadge({ level }: { level: ThreatLevel }) {
  return (
    <span className={`badge uppercase tracking-wide ${THREAT_STYLES[level]}`}>
      {level}
    </span>
  );
}

const CONFIDENCE_STYLES: Record<AssessmentConfidence | Confidence, string> = {
  low: "bg-base-700 text-slate-300",
  moderate: "bg-accent/10 text-accent",
  high: "bg-accent/20 text-accent-bright",
  confirmed: "bg-ok/15 text-ok",
};

export function ConfidenceBadge({
  level,
}: {
  level: AssessmentConfidence | Confidence;
}) {
  return (
    <span className={`badge ${CONFIDENCE_STYLES[level]}`}>
      {level} confidence
    </span>
  );
}

const STATUS_STYLES: Record<CaseStatus, string> = {
  open: "bg-accent/10 text-accent border border-accent/30",
  active: "bg-ok/10 text-ok border border-ok/30",
  pending_review: "bg-warn/10 text-warn border border-warn/30",
  closed: "bg-base-700 text-slate-400 border border-base-600",
};

const STATUS_LABEL: Record<CaseStatus, string> = {
  open: "Open",
  active: "Active",
  pending_review: "Pending review",
  closed: "Closed",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span className={`badge ${STATUS_STYLES[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function EntityTypeBadge({ type }: { type: string }) {
  return (
    <span className="badge border border-base-600 bg-base-800 text-slate-300">
      {type}
    </span>
  );
}
