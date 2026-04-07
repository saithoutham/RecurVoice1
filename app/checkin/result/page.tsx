"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AlertLevelBadge } from "@/components/AlertLevelBadge";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { Button } from "@/components/ui/button";
import { CHECKIN_KEYS, clearCheckinSession, getCheckinJson, readCheckinBlob } from "@/lib/checkin-session";
import { alertTitle, interpretHnr, interpretJitter, interpretShimmer } from "@/lib/metrics";
import { formatMetricNumber } from "@/lib/utils";

type ResultPayload = {
  day_number: number;
  baseline_complete: boolean;
  status: "calibrating" | "active";
  cusum_score: number | null;
  alert_level: "STABLE" | "WATCH" | "EARLY_WARNING" | "URGENT" | null;
  message: string;
  alert_message: string | null;
};

type CoughResult = {
  assessment?: string;
  findings?: string;
  trend?: string;
  confidence?: number;
  cough_count?: number;
  alert_triggered?: boolean;
  alert_reason?: string;
  respiratory_similarity?: Record<string, number>;
};

const assessmentColors: Record<string, string> = {
  NORMAL: "border-green-200 bg-green-50 text-green-800",
  MONITOR: "border-amber-200 bg-amber-50 text-amber-800",
  CONCERNING: "border-orange-200 bg-orange-50 text-orange-900",
  URGENT: "border-red-200 bg-red-50 text-red-900"
};

const trendIcons: Record<string, string> = {
  STABLE: "→",
  IMPROVING: "↑",
  WORSENING: "↓",
  INSUFFICIENT_DATA: "·"
};

function MetricCard({
  title,
  value,
  suffix,
  tone
}: {
  title: string;
  value: number;
  suffix: string;
  tone: { label: string; tone: string };
}) {
  const formatted = formatMetricNumber(value, title === "HNR" ? "hnr" : "percent");
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280]">{title}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-[#0A0A0A]">{formatted}</p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.15em] text-[#9CA3AF]">{suffix}</p>
      <p className={`mt-3 text-xs font-semibold ${tone.tone}`}>{tone.label}</p>
    </div>
  );
}

export default function CheckinResultPage() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [features, setFeatures] = useState<Record<string, number> | null>(null);
  const [coughResult, setCoughResult] = useState<CoughResult | null>(null);

  useEffect(() => {
    setResult(getCheckinJson<ResultPayload>(CHECKIN_KEYS.result));
    setFeatures(getCheckinJson<Record<string, number>>(CHECKIN_KEYS.features));
    setCoughResult(getCheckinJson<CoughResult>(CHECKIN_KEYS.coughResult));
  }, []);

  const [vowelUrl, setVowelUrl] = useState<string | null>(null);

  useEffect(() => {
    const blob = readCheckinBlob(CHECKIN_KEYS.vowelBlob);
    const url = blob ? URL.createObjectURL(blob) : null;
    setVowelUrl(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, []);

  if (!result || !features) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
        <p className="text-lg text-[#4B5563]">No result yet. Complete a check-in first.</p>
        <Link href="/checkin" className="mt-6 inline-block rounded-xl bg-[#1B4332] px-6 py-3 text-sm font-semibold text-white">
          Start check-in
        </Link>
      </div>
    );
  }

  const calibrating = !result.baseline_complete;

  return (
    <div className="space-y-5">
      {/* Main result card */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1B4332]">
              {calibrating ? `Day ${Math.min(result.day_number, 14)} of 14` : `Day ${result.day_number}`}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[#0A0A0A] md:text-3xl">
              {alertTitle(result.alert_level, calibrating)}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#4B5563]">
              {result.alert_message ?? result.message}
            </p>
          </div>
          <AlertLevelBadge level={result.alert_level} />
        </div>
      </div>

      {/* Voice metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard title="HNR" value={features.hnr_mean ?? 0} suffix="dB" tone={interpretHnr(features.hnr_mean ?? 0)} />
        <MetricCard title="Jitter" value={(features.jitter_local ?? 0) * 100} suffix="%" tone={interpretJitter((features.jitter_local ?? 0) * 100)} />
        <MetricCard title="Shimmer" value={features.shimmer_local ?? 0} suffix="%" tone={interpretShimmer(features.shimmer_local ?? 0)} />
      </div>

      {/* Cough assessment */}
      {coughResult ? (
        <div className={`rounded-2xl border p-5 ${assessmentColors[coughResult.assessment ?? ""] ?? "border-[#E5E7EB] bg-[#F9FAFB] text-[#0A0A0A]"}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Cough analysis</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{coughResult.assessment ?? "UNAVAILABLE"}</span>
              <span className="text-base">{trendIcons[coughResult.trend ?? ""] ?? "·"}</span>
            </div>
          </div>
          <p className="mt-2 text-sm leading-6">
            {coughResult.findings ?? "Cough analysis was not available for this check-in."}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <span><strong>{coughResult.cough_count ?? 0}</strong> coughs detected</span>
            <span>Confidence <strong>{Math.round((coughResult.confidence ?? 0) * 100)}%</strong></span>
            <span>Trend: <strong>{(coughResult.trend ?? "UNAVAILABLE").replace("_", " ")}</strong></span>
          </div>
          {coughResult.alert_triggered && (
            <p className="mt-3 rounded-lg border border-current/20 bg-white/60 px-3 py-2 text-xs font-semibold">
              ⚠ {coughResult.alert_reason ?? "Further review recommended."}
            </p>
          )}
        </div>
      ) : null}

      {/* Waveform */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#6B7280]">Vowel waveform</p>
        <WaveformVisualizer audioUrl={vowelUrl} />
      </div>

      {/* Context note */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
        <p className="text-sm italic leading-6 text-[#6B7280]">
          RecurVoice tracks these numbers over time. One day by itself means very little — what matters is whether your voice keeps moving in the same direction over several days.
        </p>
      </div>

      {/* Actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          onClick={() => { clearCheckinSession(); window.location.href = "/checkin"; }}
        >
          Redo check-in
        </Button>
        <Button asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
