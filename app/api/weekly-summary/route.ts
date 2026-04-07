import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { sessionCookieName, verifySessionCookie } from "@/lib/session-cookie";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";
import { sendWeeklySummaryEmail } from "@/lib/server/email";

export async function POST() {
  const token = cookies().get(sessionCookieName())?.value;
  const session = await verifySessionCookie(token);
  if (!session) {
    return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
  }

  const summary = await getCurrentDashboardSummary();
  if (!summary) {
    return NextResponse.json({ detail: "Summary not available." }, { status: 404 });
  }

  const result = await sendWeeklySummaryEmail({
    email: session.email,
    profile: summary.profile,
    summary
  });

  return NextResponse.json({ ok: true, mode: result.mode, preview: result.preview ?? null });
}
