"use client";

import { useRouter } from "next/navigation";
import type { CaseRow } from "@/lib/supabase/types";

export function CasePicker({
  cases,
  value,
}: {
  cases: CaseRow[];
  value?: string;
}) {
  const router = useRouter();
  return (
    <select
      className="input w-auto"
      value={value || ""}
      onChange={(e) => router.push(e.target.value ? `/links?case=${e.target.value}` : "/links")}
    >
      <option value="">Choose a case…</option>
      {cases.map((c) => (
        <option key={c.id} value={c.id}>
          {c.title}
        </option>
      ))}
    </select>
  );
}
