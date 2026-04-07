"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { RECURRENCE_RISK_QUESTIONS } from "@/lib/clinical";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type RecurrenceRiskResponse = {
  profile?: {
    risk_tier: "low" | "intermediate" | "high";
    raw_score: number;
  };
  detail?: string;
};

const tierCopy = {
  low: "standard watch",
  intermediate: "closer watch",
  high: "high-sensitivity watch"
} as const;

export function RecurrenceRiskFlow() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);
  const [riskTier, setRiskTier] = useState<keyof typeof tierCopy>("low");
  const [error, setError] = useState("");

  const question = RECURRENCE_RISK_QUESTIONS[index];

  async function saveAnswer(value: boolean) {
    const nextAnswers = { ...answers, [question.key]: value };
    setAnswers(nextAnswers);
    setError("");

    if (index < RECURRENCE_RISK_QUESTIONS.length - 1) {
      setIndex((current) => current + 1);
      return;
    }

    setSaving(true);
    const response = await fetch("/api/recurrence-risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: nextAnswers })
    });
    const payload = (await response.json()) as RecurrenceRiskResponse;
    if (!response.ok) {
      setError(payload.detail ?? "Could not save your recurrence risk answers.");
      setSaving(false);
      return;
    }

    setRiskTier(payload.profile?.risk_tier ?? "low");
    setSaving(false);
    setComplete(true);
  }

  if (complete) {
    return (
      <div className="space-y-6">
        <Card className="border-[#DCFCE7] bg-[#F0FDF4]">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-3xl font-semibold text-[#166534]">Risk tier saved.</h2>
            <p className="text-lg leading-8 text-[#166534]">
              We added this to your setup and set your voice tracking to a {tierCopy[riskTier]}. This works alongside your health background settings and only needs to be done once.
            </p>
          </CardContent>
        </Card>
        <Button className="w-full" onClick={() => router.push("/onboarding/caregiver")}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.18em] text-[#1B4332]">
        <span>
          Question {index + 1} of {RECURRENCE_RISK_QUESTIONS.length}
        </span>
        {index > 0 ? (
          <button
            type="button"
            className="text-[#4B5563]"
            onClick={() => setIndex((current) => current - 1)}
          >
            Back
          </button>
        ) : (
          <span />
        )}
      </div>
      <Card>
        <CardContent className="space-y-8 p-8">
          <p className="text-3xl font-semibold leading-tight">{question.label}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-16"
              onClick={() => void saveAnswer(false)}
              disabled={saving}
            >
              No
            </Button>
            <Button
              type="button"
              className="h-16"
              onClick={() => void saveAnswer(true)}
              disabled={saving}
            >
              Yes
            </Button>
          </div>
          {error ? <p className="text-base text-[#991B1B]">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
