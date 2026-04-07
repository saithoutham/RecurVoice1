"use client";

import { useState } from "react";
import Link from "next/link";

import { WEEKLY_PRO_QUESTIONS } from "@/lib/clinical";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Answers = {
  ecog_score?: number;
  cough_score?: number;
  dyspnea_score?: number;
  fatigue_score?: number;
  pain_score?: number;
};

export function WeeklyCheckinFlow() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{
    convergence_message: string;
    caregiver_notified: boolean;
    current_pro_frequency: string;
  } | null>(null);
  const [error, setError] = useState("");

  const question = WEEKLY_PRO_QUESTIONS[index];

  async function choose(optionIndex: number) {
    const nextAnswers = { ...answers, [question.key]: optionIndex };
    setAnswers(nextAnswers);
    setError("");

    if (index < WEEKLY_PRO_QUESTIONS.length - 1) {
      setIndex((current) => current + 1);
      return;
    }

    setSaving(true);
    const response = await fetch("/api/weekly-checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextAnswers)
    });
    const payload = (await response.json()) as {
      detail?: string;
      convergence_message?: string;
      caregiver_notified?: boolean;
      current_pro_frequency?: string;
    };
    if (!response.ok) {
      setError(payload.detail ?? "Could not save your weekly symptom check-in.");
      setSaving(false);
      return;
    }
    setSaving(false);
    setResult({
      convergence_message: payload.convergence_message ?? "Thank you. See you next week.",
      caregiver_notified: Boolean(payload.caregiver_notified),
      current_pro_frequency: payload.current_pro_frequency ?? "weekly"
    });
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Card className="border-[#DCFCE7] bg-[#F0FDF4]">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-3xl font-semibold text-[#166534]">Thank you. See you next week.</h2>
            <p className="text-lg leading-8 text-[#166534]">{result.convergence_message}</p>
            {result.current_pro_frequency === "biweekly" ? (
              <p className="text-base leading-7 text-[#166534]">
                We are checking in a bit more often this week to keep a close eye on things. This is routine and nothing to worry about.
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Button asChild className="w-full">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.18em] text-[#1B4332]">
        <span>
          Question {index + 1} of {WEEKLY_PRO_QUESTIONS.length}
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
        <CardContent className="space-y-6 p-8">
          <p className="text-3xl font-semibold leading-tight">{question.title}</p>
          <div className="grid gap-4">
            {question.options.map((option, optionIndex) => (
              <Button
                key={option}
                type="button"
                variant="outline"
                className="h-auto min-h-16 justify-start whitespace-normal px-5 py-5 text-left"
                disabled={saving}
                onClick={() => void choose(optionIndex)}
              >
                {option}
              </Button>
            ))}
          </div>
          {error ? <p className="text-base text-[#991B1B]">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
