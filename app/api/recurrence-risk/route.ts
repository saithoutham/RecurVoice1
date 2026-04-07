import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { deriveRecurrenceRiskProfile } from "@/lib/clinical";
import { sessionCookieName, verifySessionCookie } from "@/lib/session-cookie";
import {
  getRecurrenceRiskProfile,
  saveRecurrenceRiskProfile
} from "@/lib/server/store";

async function requireUser() {
  const token = cookies().get(sessionCookieName())?.value;
  return await verifySessionCookie(token);
}

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
  }
  const profile = await getRecurrenceRiskProfile(session.userId);
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as { answers?: Record<string, boolean> };
    if (!payload.answers) {
      return NextResponse.json({ detail: "Missing answers." }, { status: 400 });
    }

    const derived = deriveRecurrenceRiskProfile(payload.answers);
    const profile = await saveRecurrenceRiskProfile({
      userId: session.userId,
      rawScore: derived.rawScore,
      riskTier: derived.riskTier,
      cusumSensitivityMultiplier: derived.cusumSensitivityMultiplier
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Could not save recurrence risk answers."
      },
      { status: 400 }
    );
  }
}
