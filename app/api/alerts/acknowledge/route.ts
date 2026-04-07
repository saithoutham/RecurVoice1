import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { sessionCookieName, verifySessionCookie } from "@/lib/session-cookie";
import { acknowledgeAlert, acknowledgeConvergenceAlert } from "@/lib/server/store";

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
  if (!payload.kind || payload.kind === "voice") {
    await acknowledgeAlert(session.userId, payload.alertId);
  }
  if (!payload.kind || payload.kind === "convergence") {
    await acknowledgeConvergenceAlert(session.userId, payload.alertId);
  }
  return NextResponse.json({ ok: true });
}
