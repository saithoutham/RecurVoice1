import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { deriveComorbidityProfile } from "@/lib/clinical";
import { sessionCookieName, verifySessionCookie } from "@/lib/session-cookie";
import { getComorbidityProfile, saveComorbidityProfile } from "@/lib/server/store";

async function requireUser() {
  const token = cookies().get(sessionCookieName())?.value;
  return await verifySessionCookie(token);
}

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
  }
  const profile = await getComorbidityProfile(session.userId);
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

    const derived = deriveComorbidityProfile(payload.answers);
    const profile = await saveComorbidityProfile({
      userId: session.userId,
      cciScore: derived.cciScore,
      cciCategory: derived.cciCategory,
      cusumSensitivityMultiplier: derived.cusumSensitivityMultiplier,
      proThresholdMultiplier: derived.proThresholdMultiplier
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Could not save health background." },
      { status: 400 }
    );
  }
}
