import { cn } from "@/lib/utils";

export function MetricGauge({
  label,
  valueLabel,
  indicator,
  sections
}: {
  label: string;
  valueLabel: string;
  indicator: number;
  sections: Array<{ color: string; width: number; label: string }>;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#6B7280]">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-[#0A0A0A]">{valueLabel}</p>
        </div>
      </div>
      <div className="mt-6">
        <div className="relative h-4 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div className="flex h-full overflow-hidden rounded-full">
            {sections.map((section) => (
              <div
                key={`${label}-${section.label}`}
                className={cn(section.color)}
                style={{ width: `${section.width}%` }}
              />
            ))}
          </div>
          <div
            className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-4 border-white bg-[#0A0A0A] shadow"
            style={{ left: `calc(${Math.max(0, Math.min(100, indicator))}% - 12px)` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-sm text-[#6B7280]">
          {sections.map((section) => (
            <span key={`${section.label}-label`}>{section.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
