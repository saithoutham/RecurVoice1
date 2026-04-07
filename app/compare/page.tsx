import { ComparisonChart } from "@/components/charts/ComparisonChart";
import { PageIntro } from "@/components/PageIntro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";
import { listReferenceBenchmarks } from "@/lib/server/store";

function narrative(metric: string, value: number, healthyThreshold: number) {
  if (metric === "hnr_mean") {
    return value >= healthyThreshold
      ? `Your HNR of ${value.toFixed(1)} is within the normal healthy adult range. This is a good sign.`
      : `Your HNR of ${value.toFixed(1)} sits below the healthy adult median. This does not diagnose anything, but it is worth watching over time.`;
  }
  if (metric === "jitter_local") {
    return value <= healthyThreshold
      ? `Your jitter of ${value.toFixed(2)}% is within the healthy adult range.`
      : `Your jitter of ${value.toFixed(2)}% is above the healthy adult median. What matters most is whether it stays high over time.`;
  }
  return value <= healthyThreshold
    ? `Your shimmer of ${value.toFixed(2)}% is within the healthy adult range.`
    : `Your shimmer of ${value.toFixed(2)}% is above the healthy adult median. That is still only one data point, not a diagnosis.`;
}

export default async function ComparePage() {
  const summary = await getCurrentDashboardSummary();
  const benchmarks = await listReferenceBenchmarks();
  if (!summary || !summary.latestSession) return null;

  const metrics = [
    { key: "hnr_mean", label: "HNR", value: summary.latestSession.hnr_mean ?? 0 },
    { key: "jitter_local", label: "Jitter", value: (summary.latestSession.jitter_local ?? 0) * 100 },
    { key: "shimmer_local", label: "Shimmer", value: (summary.latestSession.shimmer_local ?? 0) * 100 }
  ] as const;

  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <PageIntro
          eyebrow="Clinical comparison"
          title="Compare to reference populations"
          body="These comparisons are for educational purposes only. RecurVoice compares your numbers against healthy adults, post-treatment lung cancer ranges, and confirmed vocal fold paresis ranges, then looks at where your score sits inside those populations."
        />
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-lg leading-8 text-amber-900">
            These comparisons are for educational purposes only. A score in any range does not mean you have or do not have any medical condition. Talk to your care team about your results.
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-lg leading-8 text-[#4B5563]">
            RecurVoice uses two comparison layers. First, it compares you to your own 14-day baseline, because your personal normal matters most. Second, it places today&apos;s score beside reference groups so you can understand whether your number sits closer to a healthy range or a rougher voice range. Trends over time matter more than one isolated point.
          </CardContent>
        </Card>
        {metrics.map((metric) => {
          const rows = benchmarks.filter((entry) => entry.metric === metric.key);
          const healthy = rows.find((entry) => entry.population === "healthy_adults");
          return (
            <Card key={metric.key}>
              <CardHeader><CardTitle className="text-3xl">{metric.label} comparison</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <ComparisonChart
                  data={rows.map((row, index) => ({
                    label:
                      row.population === "healthy_adults"
                        ? "Healthy"
                        : row.population === "post_treatment_lung_cancer"
                          ? "Post-treatment"
                          : "Paresis",
                    x: index + 1,
                    y: row.mean_value,
                    low: row.percentile_25,
                    high: row.percentile_75
                  }))}
                  userValue={metric.value}
                />
                <p className="text-lg leading-8 text-[#4B5563]">
                  {narrative(metric.key, metric.value, healthy?.percentile_50 ?? (metric.key === "hnr_mean" ? 15 : 1))}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
