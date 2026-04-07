"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrendInterpretationCard({
  prompt,
  cached,
  summaryType = "voice",
  title = "AI trend interpretation"
}: {
  prompt: string;
  cached: string | null;
  summaryType?: "voice" | "weekly_pro";
  title?: string;
}) {
  const [content, setContent] = useState(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;
    void fetchSummary();
  }, [cached, prompt]);

  async function fetchSummary() {
    setLoading(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        persistTrendSummary: true,
        summaryType,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const payload = (await response.json()) as { content?: string };
    setContent(payload.content ?? "Your recent scores have been steady overall.");
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-8 text-[#4B5563]">
          {loading ? "Reading your last 30 days and preparing a plain English summary..." : content}
        </p>
      </CardContent>
    </Card>
  );
}
