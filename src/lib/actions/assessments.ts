"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentConfidence, ThreatLevel } from "@/lib/supabase/types";
import { logAction } from "./audit";

function parseIndicators(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createAssessment(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const case_id = String(formData.get("case_id") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const threat_level = String(formData.get("threat_level") || "guarded") as ThreatLevel;
  const confidence_level = String(formData.get("confidence_level") || "moderate") as AssessmentConfidence;
  const summary = String(formData.get("summary") || "").trim() || null;
  const gaps = String(formData.get("gaps") || "").trim() || null;
  const recommendations = String(formData.get("recommendations") || "").trim() || null;
  const indicators = parseIndicators(String(formData.get("indicators") || ""));

  if (!title) return { error: "Title is required." };

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      case_id,
      title,
      threat_level,
      confidence_level,
      summary,
      gaps,
      recommendations,
      indicators,
      status: "draft",
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logAction(`Drafted assessment "${title}"`, case_id ?? undefined);
  revalidatePath("/assessments");
  if (case_id) revalidatePath(`/cases/${case_id}`);
  redirect(`/assessments/${data.id}`);
}

export async function updateAssessment(id: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const threat_level = String(formData.get("threat_level") || "guarded") as ThreatLevel;
  const confidence_level = String(formData.get("confidence_level") || "moderate") as AssessmentConfidence;
  const summary = String(formData.get("summary") || "").trim() || null;
  const gaps = String(formData.get("gaps") || "").trim() || null;
  const recommendations = String(formData.get("recommendations") || "").trim() || null;
  const indicators = parseIndicators(String(formData.get("indicators") || ""));

  if (!title) return { error: "Title is required." };

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("assessments")
    .select("case_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("assessments")
    .update({ title, threat_level, confidence_level, summary, gaps, recommendations, indicators })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/assessments/${id}`);
  revalidatePath("/assessments");
  if (existing?.case_id) revalidatePath(`/cases/${existing.case_id}`);
  return { error: null };
}

export async function setAssessmentStatus(id: string, status: "draft" | "final") {
  const supabase = createClient();
  const patch: Record<string, unknown> = { status };
  if (status === "final") patch.finalized_at = new Date().toISOString();

  const { error } = await supabase.from("assessments").update(patch).eq("id", id);
  if (error) return { error: error.message };

  await logAction(`Marked assessment as ${status}`, id);
  revalidatePath(`/assessments/${id}`);
  revalidatePath("/assessments");
  return { error: null };
}
