import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { sessionCookieName, verifySessionCookie } from "@/lib/session-cookie";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";
import { sendTestCaregiverEmail } from "@/lib/server/email";

export async function POST() {
  const token = cookies().get(sessionCookieName())?.value;
  const session = await verifySessionCookie(token);
  if (!session) {
    return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
  }

  const summary = await getCurrentDashboardSummary();
  if (!summary?.profile.caregiver_email) {
    return NextResponse.json({ detail: "No caregiver email configured." }, { status: 400 });
  }

  const result = await sendTestCaregiverEmail(
    summary.profile.caregiver_email,
    summary.profile.full_name
  );

  return NextResponse.json({ ok: true, mode: result.mode, preview: result.preview ?? null });
}
