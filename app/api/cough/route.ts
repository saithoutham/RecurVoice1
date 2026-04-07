import { NextResponse } from "next/server";

import { DEMO_PATIENT_ID } from "@/lib/server/current-user";

export async function POST(request: Request) {
  try {
    const incoming = await request.formData();
    const audioFile = incoming.get("audio_file") as Blob | null;
    if (!audioFile) {
      return NextResponse.json({ detail: "Missing audio_file." }, { status: 400 });
    }

    const baseUrl = process.env.RECURVOICE_API_URL ?? "http://127.0.0.1:8010";
    const apiKey = process.env.RECURVOICE_API_KEY ?? "";

    // When Python API is not configured (e.g. Vercel demo), return a mock result
    if (!apiKey) {
      return NextResponse.json({
        assessment: "NORMAL",
        findings: "Your cough recording did not show a concerning pattern today.",
        trend: "STABLE",
        confidence: 0.82,
        cough_count: 3,
        alert_triggered: false,
        alert_reason: "",
        respiratory_similarity: {
          normal: 0.82,
          irritation: 0.12,
          lower_respiratory: 0.06
        }
      });
    }

    const form = new FormData();
    form.append("patient_id", DEMO_PATIENT_ID);
    form.append("monitoring_day", String(incoming.get("monitoring_day") ?? "1"));
    form.append("calibration_complete", String(incoming.get("calibration_complete") ?? "false"));
    form.append("illness_flag", String(incoming.get("illness_flag") ?? "false"));
    form.append("audio_file", audioFile, "cough.wav");

    const upstream = await fetch(`${baseUrl}/v1/cough/analyze`, {
      method: "POST",
      headers: { "X-API-Key": apiKey },
      body: form,
      cache: "no-store"
    });

    const result = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json({ detail: "Cough analysis failed.", upstream: result }, { status: upstream.status });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Cough analysis failed." },
      { status: 500 }
    );
  }
}
