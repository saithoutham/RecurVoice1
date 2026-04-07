import { NextResponse } from "next/server";

import { appUrl } from "@/lib/config";
import {
  createPasswordResetRecord,
  resetPasswordWithToken
} from "@/lib/server/store";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; token?: string; password?: string };

    if (payload.token && payload.password) {
      await resetPasswordWithToken(payload.token, payload.email, payload.password);
      return NextResponse.json({ ok: true });
    }

    if (!payload.email) {
      return NextResponse.json({ detail: "Email is required." }, { status: 400 });
    }

    const token = await createPasswordResetRecord(payload.email);
    return NextResponse.json({
      ok: true,
      reset_url: token ? `${appUrl()}/auth/forgot-password?token=${token}` : null
    });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Could not start password reset." },
      { status: 400 }
    );
  }
}
