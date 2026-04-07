import { NextResponse } from "next/server";

import { signSessionCookie, sessionCookieName } from "@/lib/session-cookie";
import { getProfileByUserId, verifyLocalUserEmail } from "@/lib/server/store";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { token?: string };
    if (!payload.token) {
      return NextResponse.json({ detail: "Missing verification token." }, { status: 400 });
    }

    const user = await verifyLocalUserEmail(payload.token);
    const profile = await getProfileByUserId(user.id);
    const response = NextResponse.json({ ok: true });
    if (!user.email) {
      throw new Error("Verified user is missing an email address.");
    }
    response.cookies.set({
      name: sessionCookieName(),
      value: await signSessionCookie({
        userId: user.id,
        email: user.email,
        onboardingComplete: Boolean(profile?.onboarding_complete),
        issuedAt: Date.now()
      }),
      httpOnly: true,
      sameSite: "lax",
      path: "/"
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Could not verify email." },
      { status: 400 }
    );
  }
}
