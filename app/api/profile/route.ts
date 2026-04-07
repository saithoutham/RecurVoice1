import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

import { sessionCookieName, signSessionCookie, verifySessionCookie } from "@/lib/session-cookie";
import {
  completeOnboarding,
  getDashboardSummary,
  getNotificationPreferences,
  getProfileByUserId,
  recordConsents,
  updateNotificationPreferences,
  updateProfile
} from "@/lib/server/store";

async function requireUser() {
  const token = cookies().get(sessionCookieName())?.value;
  const session = await verifySessionCookie(token);
  if (!session) return null;
  return session;
}

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
  }
  const profile = await getProfileByUserId(session.userId);
  const notifications = await getNotificationPreferences(session.userId);
  const dashboard = await getDashboardSummary(session.userId);
  return NextResponse.json({ profile, notifications, dashboard });
}

export async function PATCH(request: Request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      profile?: Record<string, unknown>;
      notifications?: Record<string, unknown>;
      onboarding_complete?: boolean;
      consents?: string[];
    };

    const profile = payload.profile
      ? await updateProfile(session.userId, payload.profile as never)
      : await getProfileByUserId(session.userId);
    const notifications = payload.notifications
      ? await updateNotificationPreferences(session.userId, payload.notifications as never)
      : await getNotificationPreferences(session.userId);

    if (payload.consents?.length) {
      await recordConsents(session.userId, payload.consents, {
        ipAddress: headers().get("x-forwarded-for"),
        userAgent: headers().get("user-agent")
      });
    }

    let nextProfile = profile;
    if (payload.onboarding_complete) {
      nextProfile = await completeOnboarding(session.userId);
    }

    const response = NextResponse.json({ profile: nextProfile, notifications });
    response.cookies.set({
      name: sessionCookieName(),
      value: await signSessionCookie({
        userId: session.userId,
        email: session.email,
        onboardingComplete: Boolean(nextProfile?.onboarding_complete),
        issuedAt: Date.now()
      }),
      httpOnly: true,
      sameSite: "lax",
      path: "/"
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Could not update profile." },
      { status: 400 }
    );
  }
}
