import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { sessionCookieName, verifySessionCookie } from "@/lib/session-cookie";
import { deleteUserCompletely, exportUserData } from "@/lib/server/store";

export async function GET() {
  const token = cookies().get(sessionCookieName())?.value;
  const session = await verifySessionCookie(token);
  if (!session) {
    return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
  }

  const data = await exportUserData(session.userId);
  return NextResponse.json(data);
}

export async function DELETE() {
  const token = cookies().get(sessionCookieName())?.value;
  const session = await verifySessionCookie(token);
  if (!session) {
    return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
  }

  await deleteUserCompletely(session.userId);
  const response = NextResponse.json({ deleted: true });
  response.cookies.set({
    name: sessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
