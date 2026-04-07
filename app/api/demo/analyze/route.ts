import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getApiConfig() {
  const baseUrl = process.env.RECURVOICE_API_URL ?? "http://127.0.0.1:8010";
  const apiKey = process.env.RECURVOICE_API_KEY ?? process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey) {
    throw new Error("RECURVOICE_API_KEY is not configured.");
  }

  return { baseUrl, apiKey };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseUrl, apiKey } = getApiConfig();

    const upstream = await fetch(`${baseUrl}/v1/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error ? error.message : "Could not reach the RecurVoice API.",
      },
      { status: 502 }
    );
  }
}
