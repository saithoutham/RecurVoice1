import { NextResponse } from "next/server";

import { DEMO_PATIENT_ID } from "@/lib/server/current-user";

type AnalyzeBody = {
  timestamp?: string;
  illness_flag?: boolean;
  features?: Record<string, number>;
};

function apiConfig() {
  const baseUrl = process.env.RECURVOICE_API_URL ?? "http://127.0.0.1:8010";
  const apiKey = process.env.RECURVOICE_API_KEY ?? "";
  return { baseUrl, apiKey, available: Boolean(process.env.RECURVOICE_API_KEY) };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeBody;
    if (!body.features) {
      return NextResponse.json({ detail: "Missing features payload." }, { status: 400 });
    }

    const { baseUrl, apiKey, available } = apiConfig();

    // When Python API is not configured (e.g. Vercel demo), return a realistic mock result
    if (!available) {
      return NextResponse.json({
        status: "active",
        days_recorded: 22,
        calibration_progress: 100,
        cusum_score: 2.30,
        alert_level: "WATCH",
        consecutive_alert_days: 6,
        outlier_rejected: false,
        message: "Recording saved. Your voice shows a mild drift — we are watching closely.",
        alert_message: "Mild drift detected. Continue daily check-ins.",
        day_number: 22,
        baseline_complete: true,
        caregiver_notified: false,
        caregiver_delivery_mode: null,
        baseline_completed_now: false,
        convergence_level: 1,
        convergence_message: "We noticed a small change in your voice. Keep checking in daily.",
        current_pro_frequency: "weekly"
      });
    }

    // Register demo patient (idempotent — safe to call every time)
    await fetch(`${baseUrl}/v1/patient/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({ patient_id: DEMO_PATIENT_ID }),
      cache: "no-store"
    });

    const timestamp = body.timestamp ?? new Date().toISOString();
    const upstream = await fetch(`${baseUrl}/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({
        patient_id: DEMO_PATIENT_ID,
        timestamp,
        illness_flag: Boolean(body.illness_flag),
        features: body.features
      }),
      cache: "no-store"
    });

    const result = (await upstream.json()) as {
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

    if (!upstream.ok) {
      return NextResponse.json({ detail: "Analysis request failed.", upstream: result }, { status: upstream.status });
    }

    return NextResponse.json({
      ...result,
      day_number: result.days_recorded,
      baseline_complete: result.status === "active",
      caregiver_notified: false,
      caregiver_delivery_mode: null,
      baseline_completed_now: false,
      convergence_level: 0,
      convergence_message: result.message,
      current_pro_frequency: "weekly"
    });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Could not analyze recording." },
      { status: 500 }
    );
  }
}
