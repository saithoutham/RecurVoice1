import { NextResponse } from "next/server";

import { computeCompositeProScore, convergenceStatusMessage, acousticSignalState } from "@/lib/clinical";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";

export async function GET() {
  const summary = await getCurrentDashboardSummary();
  return NextResponse.json({
    latest: summary.latestProAssessment ?? null,
    frequency: summary.currentProFrequency ?? "weekly",
    due: summary.weeklyCheckinDue ?? true
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      ecog_score?: number;
      cough_score?: number;
      dyspnea_score?: number;
      fatigue_score?: number;
      pain_score?: number;
    };

    const { ecog_score, cough_score, dyspnea_score, fatigue_score, pain_score } = payload;
    if (
      typeof ecog_score !== "number" ||
      typeof cough_score !== "number" ||
      typeof dyspnea_score !== "number" ||
      typeof fatigue_score !== "number" ||
      typeof pain_score !== "number"
    ) {
      return NextResponse.json({ detail: "Missing weekly symptom answers." }, { status: 400 });
    }

    const compositeProScore = computeCompositeProScore({
      ecogScore: ecog_score,
      coughScore: cough_score,
      dyspneaScore: dyspnea_score,
      fatigueScore: fatigue_score,
      painScore: pain_score
    });

    // Derive convergence from current acoustic state + today's PRO score
    const summary = await getCurrentDashboardSummary();
    const acousticState = acousticSignalState(
      summary.latestSession?.cusum_score ?? null,
      summary.latestSession?.alert_level ?? null
    );

    // Simple convergence: if voice has any drift AND symptoms are elevated, bump level
    const proElevated = compositeProScore >= 30;
    let convergenceLevel = 0;
    if (acousticState === "crossed_threshold" && proElevated) {
      convergenceLevel = 2;
    } else if (acousticState === "crossed_threshold" || (acousticState === "subclinical_drift" && proElevated)) {
      convergenceLevel = 1;
    }

    return NextResponse.json({
      assessment: {
        composite_pro_score: compositeProScore,
        ecog_score,
        cough_score,
        dyspnea_score,
        fatigue_score,
        pain_score,
        assessed_at: new Date().toISOString(),
        alert_triggered: convergenceLevel >= 2
      },
      frequency: "weekly",
      convergence_level: convergenceLevel,
      convergence_message: convergenceStatusMessage(convergenceLevel as 0 | 1 | 2 | 3),
      caregiver_notified: false,
      caregiver_delivery_mode: "none",
      current_pro_frequency: "weekly"
    });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Could not save weekly check-in." },
      { status: 400 }
    );
  }
}
