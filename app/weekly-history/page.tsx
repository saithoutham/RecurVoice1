import { PageIntro } from "@/components/PageIntro";
import { TrendInterpretationCard } from "@/components/trends/TrendInterpretationCard";
import { MetricTrendChart } from "@/components/charts/MetricTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";
import { getGeneratedSummary } from "@/lib/server/store";
import { formatDate } from "@/lib/utils";

export default async function WeeklyHistoryPage() {
  const summary = await getCurrentDashboardSummary();
  if (!summary) {
    return null;
  }

  const data = summary.proAssessments.slice(-8).map((assessment) => ({
    date: assessment.assessed_at,
    value: assessment.composite_pro_score
  }));
  const cached = (await getGeneratedSummary(summary.profile.id, "weekly_pro"))?.content ?? null;
  const prompt = `Summarize this user's last ${data.length} weekly symptom scores in plain English without bullet points or raw number lists. Weekly scores: ${data.map((entry) => entry.value).join(", ")}.`;

  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <PageIntro
          eyebrow="Weekly symptom history"
          title="Your weekly symptom trend"
          body="This shows how your weekly activity level, cough, breathing, fatigue, and pain scores have been moving over time."
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Composite weekly symptom score</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length >= 2 ? (
              <MetricTrendChart
                data={data}
                lines={{ color: "#1B4332", label: "Weekly symptom score" }}
                bands={[
                  { from: 0, to: 30, fill: "#DCFCE7" },
                  { from: 30, to: 50, fill: "#FEF3C7" },
                  { from: 50, to: 70, fill: "#FFEDD5" },
                  { from: 70, to: 100, fill: "#FEE2E2" }
                ]}
                yDomain={[0, 100]}
              />
            ) : (
              <p className="text-lg leading-8 text-[#4B5563]">
                More weekly check-ins are needed before the symptom trend can be shown.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Weekly check-in history</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-left text-base">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#4B5563]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Composite</th>
                  <th className="px-4 py-3">Cough</th>
                  <th className="px-4 py-3">Shortness of breath</th>
                  <th className="px-4 py-3">Fatigue</th>
                  <th className="px-4 py-3">Pain</th>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Delta</th>
                  <th className="px-4 py-3">Alert</th>
                </tr>
              </thead>
              <tbody>
                {summary.proAssessments
                  .slice()
                  .reverse()
                  .map((assessment) => (
                    <tr key={assessment.id} className="border-b border-[#E5E7EB]">
                      <td className="px-4 py-3">{formatDate(assessment.assessed_at)}</td>
                      <td className="px-4 py-3">{assessment.composite_pro_score.toFixed(1)}</td>
                      <td className="px-4 py-3">{assessment.cough_score}</td>
                      <td className="px-4 py-3">{assessment.dyspnea_score}</td>
                      <td className="px-4 py-3">{assessment.fatigue_score}</td>
                      <td className="px-4 py-3">{assessment.pain_score}</td>
                      <td className="px-4 py-3">ECOG {assessment.ecog_score}</td>
                      <td className="px-4 py-3">
                        {assessment.pro_delta_from_last > 0 ? "Up" : assessment.pro_delta_from_last < 0 ? "Down" : "Flat"}{" "}
                        {Math.abs(assessment.pro_delta_from_last).toFixed(1)}
                      </td>
                      <td className="px-4 py-3">{assessment.alert_triggered ? "Yes" : "No"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <TrendInterpretationCard
          prompt={prompt}
          cached={cached}
          summaryType="weekly_pro"
          title="AI symptom interpretation"
        />
      </div>
    </main>
  );
}
