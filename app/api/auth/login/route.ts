import { NextResponse } from "next/server";

import { signSessionCookie, sessionCookieName } from "@/lib/session-cookie";
import { signInUser } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; password?: string };
    if (!payload.email || !payload.password) {
      return NextResponse.json({ detail: "Email and password are required." }, { status: 400 });
    }

    const result = await signInUser({
      email: payload.email,
      password: payload.password
    });

    const response = NextResponse.json({
      ok: true,
      onboarding_complete: Boolean(result.profile?.onboarding_complete)
    });
    response.cookies.set({
      name: sessionCookieName(),
      value: await signSessionCookie({
        userId: result.user.id,
        email: result.user.email || "",
        onboardingComplete: Boolean(result.profile?.onboarding_complete),
        issuedAt: Date.now()
      }),
      httpOnly: true,
      sameSite: "lax",
      path: "/"
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Could not sign in." },
      { status: 400 }
    );
  }
}
