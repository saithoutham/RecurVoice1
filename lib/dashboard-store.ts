"use client";

import type { AnalyzeResult } from "@/lib/api";
import type { FeaturePayload } from "@/lib/audio";

export type DashboardRecordingRow = {
  patient_id: string;
  timestamp: string;
  cusum_score: number | null;
  alert_level: string | null;
  features: Record<string, number>;
};

export type DashboardAlertRow = {
  patient_id: string;
  triggered_at: string;
  alert_level: string;
  cusum_score: number | null;
  acknowledged: boolean;
};

export type DashboardSessionSummary = {
  patientId: string;
  label: string;
  lastCheckIn: string;
  currentAlert: string | null;
  daysRecorded: number;
  recordings: DashboardRecordingRow[];
  alerts: DashboardAlertRow[];
};

type StoredSession = {
  patientId: string;
  recordings: DashboardRecordingRow[];
  alerts: DashboardAlertRow[];
};

const LOCAL_DASHBOARD_KEY = "recurvoice:dashboard_sessions";

function readStore(): StoredSession[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(LOCAL_DASHBOARD_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as StoredSession[];
  } catch {
    return [];
  }
}

function writeStore(sessions: StoredSession[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_DASHBOARD_KEY, JSON.stringify(sessions));
}

export function persistLocalDashboardRecording(
  patientId: string,
  timestamp: string,
  features: FeaturePayload,
  result: AnalyzeResult
) {
  const sessions = readStore();
  const existing = sessions.find((session) => session.patientId === patientId);

  const recording: DashboardRecordingRow = {
    patient_id: patientId,
    timestamp,
    cusum_score: result.cusum_score,
    alert_level: result.alert_level,
    features
  };

  if (!existing) {
    sessions.push({
      patientId,
      recordings: [recording],
      alerts:
        result.alert_level === "EARLY_WARNING" || result.alert_level === "URGENT"
          ? [
              {
                patient_id: patientId,
                triggered_at: timestamp,
                alert_level: result.alert_level,
                cusum_score: result.cusum_score,
                acknowledged: false
              }
            ]
          : []
    });
    writeStore(sessions);
    return;
  }

  const duplicateIndex = existing.recordings.findIndex((row) => row.timestamp === timestamp);
  if (duplicateIndex >= 0) {
    existing.recordings[duplicateIndex] = recording;
  } else {
    existing.recordings.push(recording);
    existing.recordings.sort(
      (left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
    );
  }

  if (result.alert_level === "EARLY_WARNING" || result.alert_level === "URGENT") {
    const hasAlert = existing.alerts.some(
      (alert) => alert.triggered_at === timestamp && alert.alert_level === result.alert_level
    );
    if (!hasAlert) {
      existing.alerts.unshift({
        patient_id: patientId,
        triggered_at: timestamp,
        alert_level: result.alert_level,
        cusum_score: result.cusum_score,
        acknowledged: false
      });
    }
  }

  writeStore(sessions);
}

export function listLocalDashboardSessions(): DashboardSessionSummary[] {
  const sessions = readStore()
    .filter((session) => session.recordings.length > 0)
    .map((session) => {
      const sortedRecordings = [...session.recordings].sort(
        (left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
      );
      const lastRecording = sortedRecordings[sortedRecordings.length - 1];
      return {
        patientId: session.patientId,
        label: "",
        lastCheckIn: lastRecording.timestamp,
        currentAlert: lastRecording.alert_level,
        daysRecorded: sortedRecordings.length,
        recordings: sortedRecordings,
        alerts: [...session.alerts].sort(
          (left, right) =>
            new Date(right.triggered_at).getTime() - new Date(left.triggered_at).getTime()
        )
      };
    })
    .sort((left, right) => new Date(right.lastCheckIn).getTime() - new Date(left.lastCheckIn).getTime());

  return sessions.map((session, index) => ({
    ...session,
    label: `Patient ${String(index + 1).padStart(3, "0")}`
  }));
}

export function acknowledgeLocalAlerts(patientId: string) {
  const sessions = readStore();
  const existing = sessions.find((session) => session.patientId === patientId);
  if (!existing) return;
  existing.alerts = existing.alerts.map((alert) => ({ ...alert, acknowledged: true }));
  writeStore(sessions);
}
