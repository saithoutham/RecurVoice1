import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { sessionCookieName, verifySessionCookie } from "@/lib/session-cookie";
import {
  getDashboardSummary,
  listConvergenceAlerts,
  listUserAlerts,
  markAlertEmailed,
  markConvergenceAlertNotified
} from "@/lib/server/store";
import { sendCaregiverAlertEmail, sendConvergenceCaregiverEmail } from "@/lib/server/email";

export async function POST(request: Request) {
  const token = cookies().get(sessionCookieName())?.value;
  const session = await verifySessionCookie(token);
  if (!session) {
    return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    alertId?: string;
    kind?: "voice" | "convergence";
  };
  const summary = await getDashboardSummary(session.userId);
  if (!summary?.profile.caregiver_email) {
    return NextResponse.json({ detail: "No caregiver email configured." }, { status: 400 });
  }

  if (payload.kind === "voice") {
    const alert = (await listUserAlerts(session.userId)).find((entry) => entry.id === payload.alertId);
    if (!alert) {
      return NextResponse.json({ detail: "Alert not found." }, { status: 404 });
    }

    const result = await sendCaregiverAlertEmail({
      patientName: summary.profile.full_name,
      caregiverEmail: summary.profile.caregiver_email,
      message: alert.message,
      alertLevel: alert.alert_level
    });
    if (result.delivered) {
      await markAlertEmailed(alert.id);
    }

    return NextResponse.json({ ok: true, mode: result.mode, preview: result.preview ?? null });
  }

  const convergenceAlert = (await listConvergenceAlerts(session.userId)).find(
    (entry) => entry.id === payload.alertId
  );
  if (!convergenceAlert) {
    return NextResponse.json({ detail: "Convergence alert not found." }, { status: 404 });
  }

  const result = await sendConvergenceCaregiverEmail({
    patientName: summary.profile.full_name,
    caregiverName: summary.profile.caregiver_name ?? "Caregiver",
    caregiverEmail: summary.profile.caregiver_email,
    level: convergenceAlert.convergence_level
  });
  if (result.delivered) {
    await markConvergenceAlertNotified(convergenceAlert.id);
  }

  return NextResponse.json({ ok: true, mode: result.mode, preview: result.preview ?? null });
}
