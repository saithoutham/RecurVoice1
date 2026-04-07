import { PageIntro } from "@/components/PageIntro";
import { CusumChart } from "@/components/charts/CusumChart";
import { MetricTrendChart } from "@/components/charts/MetricTrendChart";
import { TrendInterpretationCard } from "@/components/trends/TrendInterpretationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";
import { cusumSeries, hnrSeries, jitterSeries, shimmerSeries } from "@/lib/metrics";
import { getGeneratedSummary } from "@/lib/server/store";

export default async function TrendsPage() {
  const summary = await getCurrentDashboardSummary();
  if (!summary) return null;

  const sessions = summary.recentSessions.slice(-30);
  const latestCached = (await getGeneratedSummary(summary.profile.id, "voice"))?.content ?? summary.latestSession?.ai_interpretation ?? null;
  const prompt = `Summarize this user's last ${sessions.length} days of scores in plain English without listing raw numbers. HNR series (dB): ${sessions.map((session) => (session.hnr_mean ?? 0).toFixed(1)).join(", ")}. Jitter series (%): ${sessions.map((session) => ((session.jitter_local ?? 0) * 100).toFixed(2)).join(", ")}. Shimmer series (%): ${sessions.map((session) => ((session.shimmer_local ?? 0) * 100).toFixed(2)).join(", ")}. CUSUM drift score: ${sessions.map((session) => (session.cusum_score ?? 0).toFixed(2)).join(", ")}.`;

  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <PageIntro
          eyebrow="Trend analysis"
          title="Your full voice trend"
          body="These charts show how your voice has changed over time and when the drift score starts to accumulate."
        />

        <Card>
          <CardHeader><CardTitle className="text-3xl">HNR over time</CardTitle></CardHeader>
          <CardContent>
            {sessions.length < 3 ? <p className="text-lg leading-8 text-[#4B5563]">More data needed to show your trend.</p> : <MetricTrendChart data={hnrSeries(sessions)} lines={{ color: "#1B4332", label: "HNR" }} bands={[{ from: 15, to: 30, fill: "#DCFCE7" }, { from: 10, to: 15, fill: "#FEF3C7" }, { from: 0, to: 10, fill: "#FEE2E2" }]} yDomain={[0, 25]} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-3xl">Jitter over time</CardTitle></CardHeader>
          <CardContent>
            {sessions.length < 3 ? <p className="text-lg leading-8 text-[#4B5563]">More data needed to show your trend.</p> : <MetricTrendChart data={jitterSeries(sessions)} lines={{ color: "#1B4332", label: "Jitter" }} bands={[{ from: 0, to: 1, fill: "#DCFCE7" }, { from: 1, to: 2, fill: "#FEF3C7" }, { from: 2, to: 5, fill: "#FEE2E2" }]} yDomain={[0, 5]} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-3xl">Shimmer over time</CardTitle></CardHeader>
          <CardContent>
            {sessions.length < 3 ? <p className="text-lg leading-8 text-[#4B5563]">More data needed to show your trend.</p> : <MetricTrendChart data={shimmerSeries(sessions)} lines={{ color: "#1B4332", label: "Shimmer" }} bands={[{ from: 0, to: 3, fill: "#DCFCE7" }, { from: 3, to: 5, fill: "#FEF3C7" }, { from: 5, to: 12, fill: "#FEE2E2" }]} yDomain={[0, 12]} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-3xl">CUSUM score over time</CardTitle></CardHeader>
          <CardContent>
            {sessions.length < 3 ? <p className="text-lg leading-8 text-[#4B5563]">More data needed to show your trend.</p> : <CusumChart data={cusumSeries(sessions)} />}
          </CardContent>
        </Card>
        <TrendInterpretationCard prompt={prompt} cached={latestCached} summaryType="voice" />
      </div>
    </main>
  );
}
