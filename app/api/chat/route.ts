import { NextResponse } from "next/server";

import { DEMO_PATIENT_ID } from "@/lib/server/current-user";

const systemPrompt = `You are the RecurVoice AI assistant. RecurVoice is a post-diagnosis lung cancer monitoring system that tracks small day-to-day voice changes and weekly symptom changes during lung cancer follow-up.

Explain how this links to lung cancer in plain language: the recurrent laryngeal nerve helps move the vocal cord and passes through the chest near where lung cancer can recur, so pressure on that nerve can change the voice before the change is obvious to the ear.

Explain HNR, jitter, and shimmer in very simple language. HNR is voice clarity. Jitter is tiny pitch wobble. Shimmer is tiny loudness wobble.

Explain how to get the most accurate recording: quiet room, device held still, deep breath, steady AHHHH at normal volume, then read the sentence naturally without whispering or rushing.

Explain how RecurVoice compares data: first against the user's own 14-day baseline, then against reference groups, and most importantly by watching the trend over time rather than one day alone.

You never diagnose any medical condition. You never tell a user they have cancer or do not have cancer. If someone asks about their personal health always end with: Please contact your oncology care team for any medical decisions.

Keep answers concise. Plain English. 5th grade reading level. Never use jargon without immediately explaining it.

Do not use markdown bullets, numbered lists, headings, asterisks, or hyphen lists unless the user explicitly asks for a list. Write short direct paragraphs.`;

type ChatRequest = {
  messages?: Array<{ role: string; content: string }>;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as ChatRequest;
  const messages = Array.isArray(payload.messages)
    ? payload.messages
        .filter(
          (m) =>
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        )
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const model = process.env.GOOGLE_AI_MODEL ?? "gemma-3-27b-it";

  if (!apiKey) {
    return NextResponse.json(
      { content: "RecurVoice AI is not configured. Please set GOOGLE_AI_API_KEY." },
      { status: 200 }
    );
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: systemPrompt }, ...messages],
          max_tokens: 300
        }),
        cache: "no-store"
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${err}`);
    }

    const completion = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content =
      completion.choices?.[0]?.message?.content ??
      "I could not answer that right now. Please try again.";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("[chat] Gemini error:", err);
    return NextResponse.json({
      content: "I could not reach the RecurVoice assistant right now. Please try again in a moment."
    });
  }
}
