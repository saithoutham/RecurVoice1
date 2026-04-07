import "server-only";

import {
  acousticSignalState,
  combineCusumSensitivityMultipliers,
  caregiverMessageForLevel,
  convergenceStatusMessage,
  evaluateConvergence
} from "@/lib/clinical";
import {
  getDashboardSummary,
  logProFrequencyChange,
  markConvergenceAlertNotified,
  saveConvergenceAlert
} from "@/lib/server/store";
import { sendConvergenceCaregiverEmail } from "@/lib/server/email";

export function applyCusumSensitivity(score: number | null, multiplier: number) {
  if (score == null) return null;
  return Number((score * multiplier).toFixed(4));
}

export async function runConvergenceCheck(input: {
  userId: string;
  triggeredAt: string;
  source: "acoustic" | "weekly_pro";
}) {
  const summary = await getDashboardSummary(input.userId);
  if (!summary) {
    return {
      level: 0 as const,
      message: convergenceStatusMessage(0),
      caregiverNotified: false,
      caregiverDeliveryMode: "none" as const,
      convergenceAlertId: null as string | null
    };
  }

  const latestPro = summary.latestProAssessment;
  const previousPro = summary.proAssessments.length > 1
    ? summary.proAssessments[summary.proAssessments.length - 2]
    : null;
  const profile = summary.profile;
  const caregiverName = profile.caregiver_name ?? "Caregiver";
  const multiplier = combineCusumSensitivityMultipliers(
    summary.comorbidityProfile?.cusum_sensitivity_multiplier ?? 1,
    summary.recurrenceRiskProfile?.cusum_sensitivity_multiplier ?? 1
  );
  const effectiveAcousticScore = applyCusumSensitivity(
    summary.latestSession?.cusum_score ?? null,
    multiplier
  );

  const evaluation = evaluateConvergence({
    acousticScore: effectiveAcousticScore,
    acousticAlertLevel: summary.latestSession?.alert_level ?? null,
    latestPro,
    previousPro,
    cciCategory: summary.comorbidityProfile?.cci_category ?? null,
    proThresholdMultiplier: summary.comorbidityProfile?.pro_threshold_multiplier ?? 1
  });

  const acousticState = acousticSignalState(
    effectiveAcousticScore,
    summary.latestSession?.alert_level ?? null
  );

  let currentFrequency = summary.currentProFrequency;
  if (
    acousticState === "subclinical_drift" &&
    currentFrequency === "weekly"
  ) {
    await logProFrequencyChange({
      userId: input.userId,
      previousFrequency: "weekly",
      newFrequency: "biweekly",
      reason: "acoustic sub-clinical drift detected.",
      acousticCusumAtChange: effectiveAcousticScore ?? 0
    });
    currentFrequency = "biweekly";
  }

  if (currentFrequency === "biweekly") {
    const recentScores = summary.recentSessions
      .slice(-3)
      .map((session) => session.cusum_score ?? 0);
    if (recentScores.length === 3 && recentScores.every((score) => score < 1.5)) {
      await logProFrequencyChange({
        userId: input.userId,
        previousFrequency: "biweekly",
        newFrequency: "weekly",
        reason: "acoustic drift settled below the closer-watch range.",
        acousticCusumAtChange: recentScores[recentScores.length - 1]
      });
      currentFrequency = "weekly";
    }
  }

  const caregiverCopy = caregiverMessageForLevel(
    evaluation.level,
    profile.full_name,
    caregiverName
  );
  const shouldPersist = evaluation.level > 0 || input.source === "weekly_pro";
  const convergenceAlert = shouldPersist
    ? await saveConvergenceAlert({
        userId: input.userId,
        triggeredAt: input.triggeredAt,
        acousticCusumScore: effectiveAcousticScore,
        acousticAlertLevel: summary.latestSession?.alert_level ?? null,
        proCompositeScore: latestPro?.composite_pro_score ?? null,
        proDelta: latestPro?.pro_delta_from_last ?? null,
        cciCategory: summary.comorbidityProfile?.cci_category ?? null,
        convergenceLevel: evaluation.level,
        caregiverMessage: caregiverCopy.body
      })
    : null;

  let caregiverNotified = false;
  let caregiverDeliveryMode: "none" | "preview" | "resend" = "none";
  const shouldEmailCaregiver =
    Boolean(profile.caregiver_email) &&
    (evaluation.level >= 2 || (evaluation.level === 0 && input.source === "weekly_pro"));

  if (shouldEmailCaregiver && profile.caregiver_email) {
    const email = await sendConvergenceCaregiverEmail({
      caregiverEmail: profile.caregiver_email,
      caregiverName,
      patientName: profile.full_name,
      level: evaluation.level
    });
    caregiverNotified = email.delivered;
    caregiverDeliveryMode = email.mode;
    if (email.delivered && convergenceAlert) {
      await markConvergenceAlertNotified(convergenceAlert.id);
    }
  }

  return {
    level: evaluation.level,
    message: evaluation.message,
    caregiverNotified,
    caregiverDeliveryMode,
    convergenceAlertId: convergenceAlert?.id ?? null,
    currentFrequency
  };
}
