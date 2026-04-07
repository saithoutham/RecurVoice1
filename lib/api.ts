"use client";

import type { FeaturePayload } from "@/lib/audio";

export type AnalyzeResult = {
  status: "calibrating" | "active";
  days_recorded: number;
  calibration_progress: number;
  cusum_score: number | null;
  alert_level: "STABLE" | "WATCH" | "EARLY_WARNING" | "URGENT" | null;
  consecutive_alert_days: number;
  outlier_rejected: boolean;
  message: string;
  alert_message: string | null;
};

export async function registerSessionPatient(sessionId: string) {
  const response = await fetch("/api/demo/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ patient_id: sessionId })
  });

  if (!response.ok && response.status !== 409) {
    const payload = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(payload.detail ?? "Unable to register demo session.");
  }
}

export async function analyzeSession(
  sessionId: string,
  illnessFlag: boolean,
  features: FeaturePayload,
  timestamp = new Date().toISOString()
): Promise<AnalyzeResult> {
  const response = await fetch("/api/demo/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      patient_id: sessionId,
      timestamp,
      illness_flag: illnessFlag,
      features
    })
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(payload.detail ?? "Analysis request failed.");
  }

  return (await response.json()) as AnalyzeResult;
}
