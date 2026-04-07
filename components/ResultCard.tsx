import type { AnalyzeResult } from "@/lib/api";

const alertStyles: Record<
  NonNullable<AnalyzeResult["alert_level"]> | "CALIBRATING",
  { icon: string; title: string; classes: string }
> = {
  CALIBRATING: {
    icon: "check",
    title: "Voice looks stable",
    classes: "border-green-200 bg-green-50 text-green-950"
  },
  STABLE: {
    icon: "check",
    title: "Voice looks stable",
    classes: "border-green-200 bg-green-50 text-green-950"
  },
  WATCH: {
    icon: "eye",
    title: "Small change noticed",
    classes: "border-yellow-200 bg-yellow-50 text-yellow-950"
  },
  EARLY_WARNING: {
    icon: "warn",
    title: "Gradual change detected",
    classes: "border-orange-200 bg-orange-50 text-orange-950"
  },
  URGENT: {
    icon: "bell",
    title: "Contact your care team today",
    classes: "border-red-200 bg-red-50 text-red-950"
  }
};

function Icon({ name }: { name: string }) {
  if (name === "eye") {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path
          d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "warn") {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3 2.5 20h19L12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (name === "bell") {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 18h8m-7 0a3 3 0 0 0 6 0m4-2H5l1.2-1.4a2 2 0 0 0 .5-1.3V10a5.3 5.3 0 1 1 10.6 0v3.3a2 2 0 0 0 .5 1.3L19 16Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path
        d="m5 12 4.2 4.2L19 6.4"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ResultCard({ result }: { result: AnalyzeResult }) {
  const variant = result.status === "calibrating" || !result.alert_level ? "CALIBRATING" : result.alert_level;
  const style = alertStyles[variant];

  return (
    <div className={`rounded-[28px] border p-5 shadow-panel ${style.classes}`}>
      <div className="flex items-start gap-3.5">
        <div className="rounded-2xl border border-current/10 bg-white/70 p-2.5">
          <Icon name={style.icon} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold md:text-[2rem]">{style.title}</h2>
          <p className="mt-2 max-w-2xl text-base leading-7 opacity-80">{result.message}</p>
        </div>
      </div>
    </div>
  );
}
