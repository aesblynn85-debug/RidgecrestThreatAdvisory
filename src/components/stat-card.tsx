import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <p className="kicker">{label}</p>
        {icon && <div className="text-accent/70">{icon}</div>}
      </div>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
    </div>
  );
}
