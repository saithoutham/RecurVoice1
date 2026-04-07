import { NextResponse } from "next/server";

import { signUpUser } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
    };

    if (!payload.fullName || !payload.email || !payload.password) {
      return NextResponse.json({ detail: "Missing required signup fields." }, { status: 400 });
    }

    const result = await signUpUser({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password
    });

    return NextResponse.json({
      ok: true,
      verification_url: result.verificationUrl,
      email_mode: "preview"
    });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Could not create account." },
      { status: 400 }
    );
  }
}
