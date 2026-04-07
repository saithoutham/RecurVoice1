import type { SessionRecord } from "@/lib/types";

export function alertVariant(level: string | null) {
  switch (level) {
    case "URGENT":
      return "urgent";
    case "EARLY_WARNING":
      return "early";
    case "WATCH":
      return "watch";
    default:
      return "stable";
  }
}

export function alertTitle(level: string | null, calibrating = false) {
  if (calibrating) return "Building your baseline";
  switch (level) {
    case "URGENT":
      return "Contact your care team today";
    case "EARLY_WARNING":
      return "Gradual change detected";
    case "WATCH":
      return "Small change noticed";
    default:
      return "Voice looks stable";
  }
}

export function interpretHnr(value: number) {
  if (value > 15) return { label: "Normal", tone: "text-green-700", zone: "green" };
  if (value >= 10) return { label: "Slightly reduced", tone: "text-amber-700", zone: "amber" };
  return { label: "Reduced", tone: "text-red-700", zone: "red" };
}

export function interpretJitter(value: number) {
  if (value < 1) return { label: "Normal", tone: "text-green-700", zone: "green" };
  if (value <= 2) return { label: "Slightly elevated", tone: "text-amber-700", zone: "amber" };
  return { label: "Elevated", tone: "text-red-700", zone: "red" };
}

export function interpretShimmer(value: number) {
  if (value < 3) return { label: "Normal", tone: "text-green-700", zone: "green" };
  if (value <= 5) return { label: "Slightly elevated", tone: "text-amber-700", zone: "amber" };
  return { label: "Elevated", tone: "text-red-700", zone: "red" };
}

export function trendDirection(values: number[]) {
  if (values.length < 2) return "flat";
  const last = values[values.length - 1];
  const previous = values[values.length - 2];
  if (last > previous) return "up";
  if (last < previous) return "down";
  return "flat";
}

export function hnrSeries(sessions: SessionRecord[]) {
  return sessions.map((session) => ({
    date: session.recorded_at,
    value: session.hnr_mean ?? 0
  }));
}

export function jitterSeries(sessions: SessionRecord[]) {
  return sessions.map((session) => ({
    date: session.recorded_at,
    value: (session.jitter_local ?? 0) * 100
  }));
}

export function shimmerSeries(sessions: SessionRecord[]) {
  return sessions.map((session) => ({
    date: session.recorded_at,
    value: (session.shimmer_local ?? 0) * 100
  }));
}

export function cusumSeries(sessions: SessionRecord[]) {
  return sessions.map((session) => ({
    date: session.recorded_at,
    value: session.cusum_score ?? 0
  }));
}
